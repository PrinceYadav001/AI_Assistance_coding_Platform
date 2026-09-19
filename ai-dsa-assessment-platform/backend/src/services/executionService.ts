import axios from 'axios';
import { config } from '../config/config';

export interface ExecutionRequest {
  code: string;
  language: string;
  input?: string;
  timeLimit?: number;
  memoryLimit?: number;
}

export interface ExecutionResult {
  status: string;
  stdout?: string;
  stderr?: string;
  compileError?: string;
  runtimeError?: string;
  executionTime?: number;
  memoryUsed?: number;
  exitCode?: number;
}

export interface TestRunResult {
  testId: string;
  input: string;
  expected: string;
  actual: string;
  status: 'PASSED' | 'FAILED' | 'ERROR' | 'TIMEOUT';
  executionTime: number;
  memoryUsed: number;
  isHidden: boolean;
}

// Judge0 language IDs
const LANGUAGE_IDS: Record<string, number> = {
  java: 62,
  python: 71,
  cpp: 54,
  javascript: 63,
};

// Judge0 status IDs
const STATUS_MAP: Record<number, string> = {
  1: 'QUEUED',
  2: 'PROCESSING',
  3: 'ACCEPTED',
  4: 'WRONG_ANSWER',
  5: 'TIME_LIMIT_EXCEEDED',
  6: 'COMPILE_ERROR',
  7: 'RUNTIME_ERROR',
  8: 'RUNTIME_ERROR',
  9: 'RUNTIME_ERROR',
  10: 'RUNTIME_ERROR',
  11: 'RUNTIME_ERROR',
  12: 'MEMORY_LIMIT_EXCEEDED',
  13: 'INTERNAL_ERROR',
  14: 'EXECUTION_FORMAT_ERROR',
};

async function submitToJudge0(
  req: ExecutionRequest
): Promise<ExecutionResult> {
  const languageId = LANGUAGE_IDS[req.language] || 62;

  if (!config.execution.judge0ApiKey) {
    return createMockExecutionResult(req);
  }

  try {
    const submitRes = await axios.post(
      `${config.execution.judge0Url}/submissions?base64_encoded=false&wait=true`,
      {
        source_code: req.code,
        language_id: languageId,
        stdin: req.input || '',
        cpu_time_limit: req.timeLimit || 2,
        memory_limit: (req.memoryLimit || 256) * 1024,
      },
      {
        headers: {
          'X-RapidAPI-Key': config.execution.judge0ApiKey,
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    const result = submitRes.data;
    const statusId = result.status?.id || 13;

    return {
      status: STATUS_MAP[statusId] || 'INTERNAL_ERROR',
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      compileError: result.compile_output || '',
      executionTime: parseFloat(result.time || '0') * 1000,
      memoryUsed: result.memory || 0,
      exitCode: result.exit_code || 0,
    };
  } catch (err) {
    console.error('Judge0 execution error:', err);
    throw new Error('EXECUTION_SERVICE_UNAVAILABLE');
  }
}

function createMockExecutionResult(req: ExecutionRequest): ExecutionResult {
  // Development fallback when no Judge0 API key
  console.warn('⚠️  No Judge0 API key. Using mock execution.');
  
  // Basic syntax check
  if (req.code.includes('public class') && !req.code.includes('syntax_error')) {
    return {
      status: 'ACCEPTED',
      stdout: 'Code executed (mock mode - configure Judge0 for real execution)',
      stderr: '',
      executionTime: 100,
      memoryUsed: 1024,
      exitCode: 0,
    };
  }
  
  return {
    status: 'COMPILE_ERROR',
    stdout: '',
    stderr: '',
    compileError: 'Mock mode: Please configure JUDGE0_API_KEY for real code execution',
    executionTime: 0,
    memoryUsed: 0,
    exitCode: 1,
  };
}

export async function executeCode(req: ExecutionRequest): Promise<ExecutionResult> {
  return submitToJudge0(req);
}

export async function runTestCases(
  code: string,
  language: string,
  testCases: Array<{ input: string; expectedOutput: string; _id?: unknown }>,
  isHidden: boolean,
  timeLimit: number,
  memoryLimit: number
): Promise<TestRunResult[]> {
  const results: TestRunResult[] = [];

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    try {
      const exec = await executeCode({
        code,
        language,
        input: tc.input,
        timeLimit,
        memoryLimit,
      });

      const actual = (exec.stdout || '').trim();
      const expected = tc.expectedOutput.trim();
      let status: 'PASSED' | 'FAILED' | 'ERROR' | 'TIMEOUT' = 'FAILED';

      if (exec.status === 'ACCEPTED' || exec.status === 'COMPILED') {
        status = actual === expected ? 'PASSED' : 'FAILED';
      } else if (exec.status === 'TIME_LIMIT_EXCEEDED') {
        status = 'TIMEOUT';
      } else {
        status = 'ERROR';
      }

      results.push({
        testId: (tc._id?.toString() || `test-${i}`),
        input: isHidden ? '[hidden]' : tc.input,
        expected: isHidden ? '[hidden]' : expected,
        actual: isHidden ? (status === 'PASSED' ? '[passed]' : '[failed]') : actual,
        status,
        executionTime: exec.executionTime || 0,
        memoryUsed: exec.memoryUsed || 0,
        isHidden,
      });
    } catch (err) {
      results.push({
        testId: `test-${i}`,
        input: isHidden ? '[hidden]' : tc.input,
        expected: isHidden ? '[hidden]' : tc.expectedOutput,
        actual: 'ERROR',
        status: 'ERROR',
        executionTime: 0,
        memoryUsed: 0,
        isHidden,
      });
    }
  }

  return results;
}
