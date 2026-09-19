import dotenv from 'dotenv';
dotenv.config({ path: require('path').resolve(__dirname, '../../.env') });

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDatabase } from '../config/database';
import { User } from '../models/User';
import { Problem } from '../models/Problem';

const problems = [
  {
    title: 'Reverse a Singly Linked List',
    slug: 'reverse-linked-list',
    statement: `A singly linked list contains integer values. Your task is to reverse the linked list in-place and return the new head of the reversed list.

You must NOT allocate new nodes. Instead, reverse the pointers of the existing nodes.

For example, if the list is: 1 → 2 → 3 → 4 → 5 → null
After reversal: 5 → 4 → 3 → 2 → 1 → null`,
    inputDescription: 'The head node of a singly linked list containing integer values.',
    outputDescription: 'The new head node of the reversed linked list.',
    constraints: [
      'The number of nodes is in the range [0, 5000]',
      '-5000 <= Node.val <= 5000',
      'Do not allocate new nodes',
      'Reverse in-place using pointer manipulation',
    ],
    examples: [
      {
        input: 'head = [1, 2, 3, 4, 5]',
        output: '[5, 4, 3, 2, 1]',
        explanation: 'All pointers are reversed. The old tail (5) becomes the new head.',
      },
      {
        input: 'head = [1, 2]',
        output: '[2, 1]',
        explanation: 'A two-node list is reversed.',
      },
      {
        input: 'head = []',
        output: '[]',
        explanation: 'An empty list returns null.',
      },
    ],
    difficulty: 'Moderate',
    topic: 'Linked List',
    secondaryTopics: ['Pointers'],
    patterns: ['Pointer Manipulation', 'Iterative Reversal'],
    tags: ['linked-list', 'pointer', 'reversal', 'in-place'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Facebook'],
    starterCode: `class ListNode {
    int val;
    ListNode next;
    ListNode(int val) { this.val = val; }
}

public class Main {

    public static ListNode reverseList(ListNode head) {
        // Write your solution here
        
        return null;
    }

    public static void main(String[] args) {
        // Test your solution
    }
}`,
    functionSignature: 'public static ListNode reverseList(ListNode head)',
    inputParser: 'linked-list',
    outputFormatter: 'linked-list',
    timeLimit: 2,
    memoryLimit: 256,
    visibleTestCases: [
      { input: '1 2 3 4 5', expectedOutput: '5 4 3 2 1', description: 'Five-node list', category: 'Basic' },
      { input: '1 2', expectedOutput: '2 1', description: 'Two-node list', category: 'Basic' },
      { input: '', expectedOutput: '', description: 'Empty list', category: 'Edge' },
    ],
    hiddenTestCases: [
      { input: '1', expectedOutput: '1', description: 'Single node', category: 'Minimal' },
      { input: '1 2 3', expectedOutput: '3 2 1', description: 'Three nodes', category: 'Basic' },
      { input: '-1 -2 -3', expectedOutput: '-3 -2 -1', description: 'Negative values', category: 'Negative' },
      { input: '1 1 1', expectedOutput: '1 1 1', description: 'Duplicate values', category: 'Duplicate' },
      { input: '5000 -5000 0', expectedOutput: '0 -5000 5000', description: 'Boundary values', category: 'Boundary' },
      { input: '1 2 3 4 5 6 7 8 9 10', expectedOutput: '10 9 8 7 6 5 4 3 2 1', description: 'Ten nodes', category: 'Large' },
      { input: '0', expectedOutput: '0', description: 'Zero value', category: 'Edge' },
      { input: '-5000', expectedOutput: '-5000', description: 'Min value single', category: 'Boundary' },
    ],
    bruteForceApproach: 'Store all values in an array, create a new linked list in reverse order. O(n) time and O(n) space.',
    optimalApproach: 'Use three pointers (prev, curr, next) to reverse links iteratively. O(n) time, O(1) space.',
    solution: `public static ListNode reverseList(ListNode head) {
    ListNode prev = null;
    ListNode curr = head;
    while (curr != null) {
        ListNode next = curr.next;
        curr.next = prev;
        prev = curr;
        curr = next;
    }
    return prev;
}`,
    explanation: 'We maintain three pointers: prev (initially null), curr (starts at head), and next (temporary). In each iteration, we save curr.next, point curr.next to prev, advance prev to curr, and advance curr to the saved next.',
    hints: [
      { level: 1, content: 'Think about what "reversing" means in terms of pointer direction.' },
      { level: 2, content: 'You need to manipulate the "next" pointers. What happens if you point each node\'s next to the previous node?' },
      { level: 3, content: 'Before changing a node\'s next pointer, you need to save the original next value, otherwise you lose access to the rest of the list.' },
      { level: 4, content: 'Use three pointers: prev, curr, and next. Initialize prev = null, curr = head.' },
      { level: 5, content: 'Algorithm: save next = curr.next, set curr.next = prev, move prev = curr, move curr = next.' },
      { level: 6, content: 'Full solution: iterate while curr != null, performing these 4 steps each time. Return prev at the end (new head).' },
    ],
    edgeCases: ['Empty list (head = null)', 'Single node list', 'All same values', 'Negative values', 'Very long list (5000 nodes)'],
    isPublished: true,
  },
  {
    title: 'Two Sum',
    slug: 'two-sum',
    statement: `Given an array of integers nums and an integer target, return the indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    inputDescription: 'An array of integers nums and an integer target.',
    outputDescription: 'Array of two indices [i, j] where nums[i] + nums[j] == target.',
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists',
    ],
    examples: [
      { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]', explanation: 'nums[0] + nums[1] = 2 + 7 = 9' },
      { input: 'nums = [3, 2, 4], target = 6', output: '[1, 2]', explanation: 'nums[1] + nums[2] = 2 + 4 = 6' },
      { input: 'nums = [3, 3], target = 6', output: '[0, 1]', explanation: 'nums[0] + nums[1] = 3 + 3 = 6' },
    ],
    difficulty: 'Easy',
    topic: 'Hashing',
    secondaryTopics: ['Arrays'],
    patterns: ['Hash Map Lookup'],
    tags: ['hash-map', 'array', 'two-sum'],
    companies: ['Amazon', 'Google', 'Facebook', 'Apple'],
    starterCode: `import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        // Write your solution here
        
        return new int[]{};
    }

    public static void main(String[] args) {
    }
}`,
    functionSignature: 'public static int[] twoSum(int[] nums, int target)',
    timeLimit: 2,
    memoryLimit: 256,
    visibleTestCases: [
      { input: '2 7 11 15\n9', expectedOutput: '0 1', category: 'Basic' },
      { input: '3 2 4\n6', expectedOutput: '1 2', category: 'Basic' },
      { input: '3 3\n6', expectedOutput: '0 1', category: 'Duplicate' },
    ],
    hiddenTestCases: [
      { input: '1 2 3 4 5\n9', expectedOutput: '3 4', category: 'Basic' },
      { input: '-1 -2 -3 -4 -5\n-8', expectedOutput: '2 4', category: 'Negative' },
      { input: '1000000000 2\n1000000002', expectedOutput: '0 1', category: 'Large' },
      { input: '0 4 3 0\n0', expectedOutput: '0 3', category: 'Zero' },
      { input: '2 5 5 11\n10', expectedOutput: '1 2', category: 'Duplicate' },
    ],
    bruteForceApproach: 'O(n²): For each pair (i, j), check if nums[i] + nums[j] == target.',
    optimalApproach: 'O(n): Use a HashMap to store each number and its index. For each number, check if (target - number) exists in the map.',
    solution: `public static int[] twoSum(int[] nums, int target) {
    Map<Integer, Integer> map = new HashMap<>();
    for (int i = 0; i < nums.length; i++) {
        int complement = target - nums[i];
        if (map.containsKey(complement)) {
            return new int[]{map.get(complement), i};
        }
        map.put(nums[i], i);
    }
    return new int[]{};
}`,
    explanation: 'Store each visited number in a HashMap with its index. For each new number, check if its complement (target - num) is already in the map.',
    hints: [
      { level: 1, content: 'Think about what you are searching for at each step. For each element x, you need target - x.' },
      { level: 2, content: 'A brute force is O(n²). Can you reduce lookups to O(1) using an appropriate data structure?' },
      { level: 3, content: 'A HashMap stores key-value pairs and offers O(1) lookup. What would be a good key? What would be the value?' },
      { level: 4, content: 'Store (number → index) in the map. For each new number, check if (target - number) already exists.' },
      { level: 5, content: 'Iterate once. For each nums[i], check if map.containsKey(target - nums[i]). If yes, return indices.' },
      { level: 6, content: 'Map<Integer,Integer> map = new HashMap<>(); For each i: if map.has(target-nums[i]) return both indices, else map.put(nums[i], i).' },
    ],
    edgeCases: ['Negative numbers', 'Zero in array', 'Duplicate values', 'Large values near Integer.MAX_VALUE', 'Two-element array'],
    isPublished: true,
  },
  {
    title: 'Maximum Subarray Sum',
    slug: 'maximum-subarray-sum',
    statement: `Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.

A subarray is a contiguous part of an array.`,
    inputDescription: 'An array of integers nums.',
    outputDescription: 'The maximum sum of a contiguous subarray.',
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4',
    ],
    examples: [
      { input: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]', output: '6', explanation: 'Subarray [4,-1,2,1] has the largest sum = 6.' },
      { input: 'nums = [1]', output: '1', explanation: 'Single element is the subarray.' },
      { input: 'nums = [5, 4, -1, 7, 8]', output: '23', explanation: 'The entire array [5,4,-1,7,8] gives sum 23.' },
    ],
    difficulty: 'Easy',
    topic: 'Dynamic Programming',
    secondaryTopics: ['Arrays', 'Greedy'],
    patterns: ["Kadane's Algorithm", 'Dynamic Programming'],
    tags: ['dp', 'greedy', 'subarray', 'kadane'],
    companies: ['Amazon', 'Google', 'Apple', 'Bloomberg'],
    starterCode: `public class Main {
    public static int maxSubArray(int[] nums) {
        // Write your solution here
        
        return 0;
    }

    public static void main(String[] args) {
    }
}`,
    functionSignature: 'public static int maxSubArray(int[] nums)',
    timeLimit: 2,
    memoryLimit: 256,
    visibleTestCases: [
      { input: '-2 1 -3 4 -1 2 1 -5 4', expectedOutput: '6', category: 'Basic' },
      { input: '1', expectedOutput: '1', category: 'Single' },
      { input: '5 4 -1 7 8', expectedOutput: '23', category: 'All Positive' },
    ],
    hiddenTestCases: [
      { input: '-1 -2 -3', expectedOutput: '-1', category: 'All Negative' },
      { input: '0 0 0', expectedOutput: '0', category: 'All Zero' },
      { input: '-10000 10000', expectedOutput: '10000', category: 'Boundary' },
      { input: '1 2 3 4 5 6 7 8 9 10', expectedOutput: '55', category: 'Increasing' },
      { input: '-2 -3 4 -1 -2 1 5 -3', expectedOutput: '7', category: 'Mixed' },
    ],
    bruteForceApproach: 'O(n²): Try all subarrays and find maximum sum.',
    optimalApproach: "Kadane's Algorithm O(n): currentSum = max(nums[i], currentSum + nums[i]). maxSum = max(maxSum, currentSum).",
    solution: `public static int maxSubArray(int[] nums) {
    int maxSum = nums[0];
    int currentSum = nums[0];
    for (int i = 1; i < nums.length; i++) {
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }
    return maxSum;
}`,
    explanation: "Kadane's algorithm: at each position, decide whether to start fresh from this element or extend the existing subarray. currentSum = max(nums[i], currentSum + nums[i]).",
    hints: [
      { level: 1, content: 'This is a subarray problem. Think about what decision you make at each element.' },
      { level: 2, content: 'At each position, you can either start a new subarray from this element, or extend the current subarray.' },
      { level: 3, content: 'If the current sum becomes negative, it\'s better to start fresh from the next element.' },
      { level: 4, content: 'Maintain two variables: currentSum and maxSum. For each element, update them.' },
      { level: 5, content: 'currentSum = Math.max(nums[i], currentSum + nums[i]); maxSum = Math.max(maxSum, currentSum);' },
      { level: 6, content: "This is Kadane's algorithm. Initialize both to nums[0]. Iterate from i=1." },
    ],
    edgeCases: ['All negative numbers', 'All zeros', 'Single element', 'All positive', 'Large array'],
    isPublished: true,
  },
  {
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    statement: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    inputDescription: 'A string s containing only bracket characters: (, ), {, }, [, ]',
    outputDescription: '"true" if the string is valid, "false" otherwise.',
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only: ()[]{}'
    ],
    examples: [
      { input: 's = "()"', output: 'true', explanation: 'Open and close brackets match.' },
      { input: 's = "()[]{}"', output: 'true', explanation: 'All three pairs are correctly matched.' },
      { input: 's = "(]"', output: 'false', explanation: 'Mismatched brackets.' },
    ],
    difficulty: 'Easy',
    topic: 'Stack',
    secondaryTopics: ['Strings'],
    patterns: ['Stack-based Matching'],
    tags: ['stack', 'string', 'parentheses', 'matching'],
    companies: ['Amazon', 'Google', 'Microsoft', 'Facebook'],
    starterCode: `import java.util.*;

public class Main {
    public static boolean isValid(String s) {
        // Write your solution here
        
        return false;
    }

    public static void main(String[] args) {
    }
}`,
    functionSignature: 'public static boolean isValid(String s)',
    timeLimit: 2,
    memoryLimit: 256,
    visibleTestCases: [
      { input: '()', expectedOutput: 'true', category: 'Basic' },
      { input: '()[]{}', expectedOutput: 'true', category: 'Multiple' },
      { input: '(]', expectedOutput: 'false', category: 'Invalid' },
    ],
    hiddenTestCases: [
      { input: '([)]', expectedOutput: 'false', category: 'Interleaved' },
      { input: '{[]}', expectedOutput: 'true', category: 'Nested' },
      { input: ']', expectedOutput: 'false', category: 'Single Close' },
      { input: '((', expectedOutput: 'false', category: 'Unclosed' },
      { input: '', expectedOutput: 'true', category: 'Empty' },
      { input: '((((()))))', expectedOutput: 'true', category: 'Deeply Nested' },
    ],
    bruteForceApproach: 'Repeatedly remove matched pairs until no more matches or string changes.',
    optimalApproach: 'Stack: push open brackets, pop on close bracket and verify match. O(n) time, O(n) space.',
    solution: `public static boolean isValid(String s) {
    Stack<Character> stack = new Stack<>();
    for (char c : s.toCharArray()) {
        if (c == '(' || c == '{' || c == '[') {
            stack.push(c);
        } else {
            if (stack.isEmpty()) return false;
            char top = stack.pop();
            if (c == ')' && top != '(') return false;
            if (c == '}' && top != '{') return false;
            if (c == ']' && top != '[') return false;
        }
    }
    return stack.isEmpty();
}`,
    explanation: 'Push opening brackets onto stack. For closing brackets, pop from stack and verify it matches. If stack is empty when popping, or mismatches occur, return false. At the end, stack must be empty.',
    hints: [
      { level: 1, content: 'Think about the Last-In-First-Out property. Which data structure has this property?' },
      { level: 2, content: 'A Stack is perfect here. When you see an opening bracket, push it. When you see a closing bracket, what should you do?' },
      { level: 3, content: 'When you see a closing bracket, the most recently opened bracket should match it.' },
      { level: 4, content: 'Pop from the stack when you encounter a closing bracket. Check if it matches the closing bracket.' },
      { level: 5, content: 'Also handle edge cases: empty stack when you see a closing bracket, or non-empty stack at the end.' },
      { level: 6, content: 'Push opening brackets, pop on closing and verify. Return stack.isEmpty() at the end.' },
    ],
    edgeCases: ['Empty string', 'Only opening brackets', 'Only closing brackets', 'Single character', 'Interleaved wrong types'],
    isPublished: true,
  },
  {
    title: 'Binary Search',
    slug: 'binary-search',
    statement: `Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.

You must write an algorithm with O(log n) runtime complexity.`,
    inputDescription: 'A sorted array nums of integers and a target integer.',
    outputDescription: 'The index of target in nums, or -1 if not found.',
    constraints: [
      '1 <= nums.length <= 10^4',
      '-10^4 < nums[i], target < 10^4',
      'All integers in nums are unique',
      'nums is sorted in ascending order',
    ],
    examples: [
      { input: 'nums = [-1, 0, 3, 5, 9, 12], target = 9', output: '4', explanation: '9 exists in nums and its index is 4.' },
      { input: 'nums = [-1, 0, 3, 5, 9, 12], target = 2', output: '-1', explanation: '2 does not exist in nums.' },
      { input: 'nums = [5], target = 5', output: '0', explanation: 'Single element, found at index 0.' },
    ],
    difficulty: 'Easy',
    topic: 'Binary Search',
    secondaryTopics: ['Arrays'],
    patterns: ['Binary Search'],
    tags: ['binary-search', 'array', 'sorted', 'logarithmic'],
    companies: ['Google', 'Amazon', 'Microsoft'],
    starterCode: `public class Main {
    public static int search(int[] nums, int target) {
        // Write your solution here
        
        return -1;
    }

    public static void main(String[] args) {
    }
}`,
    functionSignature: 'public static int search(int[] nums, int target)',
    timeLimit: 2,
    memoryLimit: 256,
    visibleTestCases: [
      { input: '-1 0 3 5 9 12\n9', expectedOutput: '4', category: 'Basic' },
      { input: '-1 0 3 5 9 12\n2', expectedOutput: '-1', category: 'Not Found' },
      { input: '5\n5', expectedOutput: '0', category: 'Single' },
    ],
    hiddenTestCases: [
      { input: '1 2 3 4 5 6 7 8 9 10\n7', expectedOutput: '6', category: 'Middle' },
      { input: '1 2 3 4 5\n1', expectedOutput: '0', category: 'First' },
      { input: '1 2 3 4 5\n5', expectedOutput: '4', category: 'Last' },
      { input: '1 3 5 7 9\n6', expectedOutput: '-1', category: 'Not Found' },
      { input: '-5000 -100 0 100 5000\n-5000', expectedOutput: '0', category: 'Boundary' },
    ],
    bruteForceApproach: 'O(n): Linear scan through array.',
    optimalApproach: 'O(log n): Maintain left and right pointers. Each step halve the search space by comparing mid element.',
    solution: `public static int search(int[] nums, int target) {
    int left = 0, right = nums.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) return mid;
        else if (nums[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
    explanation: 'Binary search divides the search space in half each iteration. mid = left + (right - left) / 2 avoids integer overflow. If mid element equals target, return mid. If less, search right half. If more, search left half.',
    hints: [
      { level: 1, content: 'The array is sorted. Can you use this property to eliminate half the elements in each step?' },
      { level: 2, content: 'Consider the middle element. If it equals target, you\'re done. If target is larger, which half do you search?' },
      { level: 3, content: 'Maintain left and right boundaries. In each iteration, compute mid = (left + right) / 2.' },
      { level: 4, content: 'Be careful with integer overflow: use mid = left + (right - left) / 2.' },
      { level: 5, content: 'Loop while left <= right. Update left = mid + 1 or right = mid - 1 based on comparison.' },
      { level: 6, content: 'Return -1 if the loop ends without finding target.' },
    ],
    edgeCases: ['Target at first index', 'Target at last index', 'Target not present', 'Single element array', 'Boundary values'],
    isPublished: true,
  },
  {
    title: 'Sliding Window Maximum',
    slug: 'sliding-window-maximum',
    statement: `You are given an array of integers nums, and a sliding window of size k which is moving from the very left of the array to the very right. You can only see the k numbers in the window. Each time the sliding window moves right by one position.

Return the maximum value in each window position.`,
    inputDescription: 'An integer array nums and an integer k (window size).',
    outputDescription: 'An array of maximum values for each window position.',
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4',
      '1 <= k <= nums.length',
    ],
    examples: [
      { input: 'nums = [1,3,-1,-3,5,3,6,7], k = 3', output: '[3,3,5,5,6,7]', explanation: 'Window [1,3,-1]: max=3. [3,-1,-3]: max=3. [-1,-3,5]: max=5. [-3,5,3]: max=5. [5,3,6]: max=6. [3,6,7]: max=7.' },
      { input: 'nums = [1], k = 1', output: '[1]', explanation: 'Single element window.' },
      { input: 'nums = [1,-1], k = 1', output: '[1,-1]', explanation: 'Window size 1, each element is the max.' },
    ],
    difficulty: 'Hard',
    topic: 'Sliding Window',
    secondaryTopics: ['Deque', 'Queue'],
    patterns: ['Monotonic Deque', 'Sliding Window'],
    tags: ['deque', 'sliding-window', 'monotonic', 'queue'],
    companies: ['Amazon', 'Google', 'Microsoft'],
    starterCode: `import java.util.*;

public class Main {
    public static int[] maxSlidingWindow(int[] nums, int k) {
        // Write your solution here
        
        return new int[]{};
    }

    public static void main(String[] args) {
    }
}`,
    functionSignature: 'public static int[] maxSlidingWindow(int[] nums, int k)',
    timeLimit: 2,
    memoryLimit: 256,
    visibleTestCases: [
      { input: '1 3 -1 -3 5 3 6 7\n3', expectedOutput: '3 3 5 5 6 7', category: 'Basic' },
      { input: '1\n1', expectedOutput: '1', category: 'Single' },
      { input: '1 -1\n1', expectedOutput: '1 -1', category: 'Window k=1' },
    ],
    hiddenTestCases: [
      { input: '9 11 8 5 7 10\n2', expectedOutput: '11 11 8 7 10', category: 'Basic' },
      { input: '1 2 3 4 5\n5', expectedOutput: '5', category: 'Full Window' },
      { input: '5 4 3 2 1\n3', expectedOutput: '5 4 3', category: 'Decreasing' },
      { input: '-3 -1 -2\n2', expectedOutput: '-1 -1', category: 'Negative' },
    ],
    bruteForceApproach: 'O(n*k): For each window, find the maximum element by scanning all k elements.',
    optimalApproach: 'O(n): Use a monotonic deque storing indices. Front always holds index of max element in current window.',
    solution: `public static int[] maxSlidingWindow(int[] nums, int k) {
    int n = nums.length;
    int[] result = new int[n - k + 1];
    Deque<Integer> deque = new ArrayDeque<>();
    for (int i = 0; i < n; i++) {
        // Remove indices outside window
        while (!deque.isEmpty() && deque.peekFirst() < i - k + 1)
            deque.pollFirst();
        // Remove smaller elements from back
        while (!deque.isEmpty() && nums[deque.peekLast()] < nums[i])
            deque.pollLast();
        deque.offerLast(i);
        if (i >= k - 1)
            result[i - k + 1] = nums[deque.peekFirst()];
    }
    return result;
}`,
    explanation: 'A monotonic deque maintains indices in decreasing order of their values. The front always has the index of the current window\'s maximum. We remove out-of-window indices from front and smaller elements from back.',
    hints: [
      { level: 1, content: 'O(n*k) brute force works but is too slow. Think about how to avoid re-scanning the entire window for each slide.' },
      { level: 2, content: 'Consider a data structure that can give you the maximum in O(1) and supports efficient updates as the window slides.' },
      { level: 3, content: 'A Deque (double-ended queue) can help. You want to maintain useful elements from the current window.' },
      { level: 4, content: 'Maintain a monotonic decreasing deque of indices. The front is always the index of the maximum element.' },
      { level: 5, content: 'When adding element i: remove indices from front that are outside window. Remove smaller elements from back. Add i to back.' },
      { level: 6, content: 'The result for each window position is nums[deque.peekFirst()].' },
    ],
    edgeCases: ['k equals n', 'All elements same', 'Decreasing sequence', 'Increasing sequence', 'Negative numbers'],
    isPublished: true,
  },
  {
    title: 'Merge Two Sorted Lists',
    slug: 'merge-two-sorted-lists',
    statement: `You are given the heads of two sorted linked lists list1 and list2. Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.

Return the head of the merged linked list.`,
    inputDescription: 'Heads of two sorted linked lists list1 and list2.',
    outputDescription: 'Head of the merged sorted linked list.',
    constraints: [
      'The number of nodes in both lists is in the range [0, 50]',
      '-100 <= Node.val <= 100',
      'Both list1 and list2 are sorted in non-decreasing order',
    ],
    examples: [
      { input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]', explanation: 'Both lists are merged in sorted order.' },
      { input: 'list1 = [], list2 = []', output: '[]', explanation: 'Both empty lists merge to empty.' },
      { input: 'list1 = [], list2 = [0]', output: '[0]', explanation: 'Empty + single element.' },
    ],
    difficulty: 'Easy',
    topic: 'Linked List',
    secondaryTopics: ['Recursion', 'Pointers'],
    patterns: ['Merge', 'Two Pointers'],
    tags: ['linked-list', 'merge', 'sorted', 'recursion'],
    companies: ['Amazon', 'Google', 'Facebook', 'Microsoft'],
    starterCode: `class ListNode {
    int val;
    ListNode next;
    ListNode(int val) { this.val = val; }
}

public class Main {
    public static ListNode mergeTwoLists(ListNode list1, ListNode list2) {
        // Write your solution here
        
        return null;
    }

    public static void main(String[] args) {
    }
}`,
    functionSignature: 'public static ListNode mergeTwoLists(ListNode list1, ListNode list2)',
    timeLimit: 2,
    memoryLimit: 256,
    visibleTestCases: [
      { input: '1 2 4\n1 3 4', expectedOutput: '1 1 2 3 4 4', category: 'Basic' },
      { input: '\n', expectedOutput: '', category: 'Both Empty' },
      { input: '\n0', expectedOutput: '0', category: 'One Empty' },
    ],
    hiddenTestCases: [
      { input: '1\n2', expectedOutput: '1 2', category: 'Single Each' },
      { input: '1 3 5\n2 4 6', expectedOutput: '1 2 3 4 5 6', category: 'Alternating' },
      { input: '-5 -3 0\n-4 -2 1', expectedOutput: '-5 -4 -3 -2 0 1', category: 'Negative' },
      { input: '1 1 1\n1 1 1', expectedOutput: '1 1 1 1 1 1', category: 'All Same' },
    ],
    bruteForceApproach: 'Collect all values into an array, sort, then build new list. O(n log n) time, O(n) space.',
    optimalApproach: 'Use a dummy head and iterate through both lists, attaching the smaller node each time. O(n+m) time, O(1) space.',
    solution: `public static ListNode mergeTwoLists(ListNode list1, ListNode list2) {
    ListNode dummy = new ListNode(0);
    ListNode current = dummy;
    while (list1 != null && list2 != null) {
        if (list1.val <= list2.val) {
            current.next = list1;
            list1 = list1.next;
        } else {
            current.next = list2;
            list2 = list2.next;
        }
        current = current.next;
    }
    current.next = (list1 != null) ? list1 : list2;
    return dummy.next;
}`,
    explanation: 'Use a dummy node to simplify head handling. Compare current nodes from both lists, attach the smaller one, advance that pointer. Attach remaining nodes at the end.',
    hints: [
      { level: 1, content: 'Since both lists are sorted, you can compare the front elements and take the smaller one.' },
      { level: 2, content: 'Use a dummy head node to avoid special-casing the head of the result list.' },
      { level: 3, content: 'Maintain a current pointer. Each iteration, pick the smaller node and advance both current and that list\'s pointer.' },
      { level: 4, content: 'When one list is exhausted, simply attach the rest of the other list.' },
      { level: 5, content: 'Loop while both list1 and list2 are not null. After loop, current.next = remaining list.' },
      { level: 6, content: 'Return dummy.next as the head of the merged list.' },
    ],
    edgeCases: ['Both empty', 'One empty', 'Lists of different lengths', 'All same values', 'Negative values'],
    isPublished: true,
  },
  {
    title: 'Longest Common Subsequence',
    slug: 'longest-common-subsequence',
    statement: `Given two strings text1 and text2, return the length of their longest common subsequence. If there is no common subsequence, return 0.

A subsequence of a string is a new string generated from the original string with some characters (can be none) deleted without changing the relative order of the remaining characters.

A common subsequence of two strings is a subsequence that is common to both strings.`,
    inputDescription: 'Two strings text1 and text2.',
    outputDescription: 'Length of the longest common subsequence.',
    constraints: [
      '1 <= text1.length, text2.length <= 1000',
      'text1 and text2 consist of only lowercase English characters',
    ],
    examples: [
      { input: 'text1 = "abcde", text2 = "ace"', output: '3', explanation: 'LCS is "ace" with length 3.' },
      { input: 'text1 = "abc", text2 = "abc"', output: '3', explanation: 'LCS is "abc" with length 3.' },
      { input: 'text1 = "abc", text2 = "def"', output: '0', explanation: 'No common subsequence.' },
    ],
    difficulty: 'Moderate',
    topic: 'Dynamic Programming',
    secondaryTopics: ['Strings'],
    patterns: ['2D DP', 'Subsequence'],
    tags: ['dp', 'string', 'subsequence', '2d-dp'],
    companies: ['Google', 'Amazon', 'Facebook', 'Apple'],
    starterCode: `public class Main {
    public static int longestCommonSubsequence(String text1, String text2) {
        // Write your solution here
        
        return 0;
    }

    public static void main(String[] args) {
    }
}`,
    functionSignature: 'public static int longestCommonSubsequence(String text1, String text2)',
    timeLimit: 2,
    memoryLimit: 256,
    visibleTestCases: [
      { input: 'abcde\nace', expectedOutput: '3', category: 'Basic' },
      { input: 'abc\nabc', expectedOutput: '3', category: 'Same Strings' },
      { input: 'abc\ndef', expectedOutput: '0', category: 'No Common' },
    ],
    hiddenTestCases: [
      { input: 'a\na', expectedOutput: '1', category: 'Single Char Match' },
      { input: 'a\nb', expectedOutput: '0', category: 'Single Char No Match' },
      { input: 'ezupkr\nubmrapg', expectedOutput: '2', category: 'Complex' },
      { input: 'abcba\nabcbcba', expectedOutput: '5', category: 'Repeated Chars' },
      { input: 'zzz\nzzz', expectedOutput: '3', category: 'All Same' },
    ],
    bruteForceApproach: 'O(2^n): Recursively try including or excluding each character.',
    optimalApproach: 'O(m*n): 2D DP. dp[i][j] = LCS of text1[0..i-1] and text2[0..j-1]. If characters match, dp[i][j] = dp[i-1][j-1] + 1, else max(dp[i-1][j], dp[i][j-1]).',
    solution: `public static int longestCommonSubsequence(String text1, String text2) {
    int m = text1.length(), n = text2.length();
    int[][] dp = new int[m + 1][n + 1];
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (text1.charAt(i-1) == text2.charAt(j-1))
                dp[i][j] = dp[i-1][j-1] + 1;
            else
                dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);
        }
    }
    return dp[m][n];
}`,
    explanation: 'Build a 2D DP table. dp[i][j] represents the LCS length for text1[0..i-1] and text2[0..j-1]. If last characters match, extend the LCS by 1. Otherwise take the best of ignoring either character.',
    hints: [
      { level: 1, content: 'Think recursively first. For each pair of indices (i, j), what are your choices?' },
      { level: 2, content: 'If text1[i] == text2[j], this character is part of LCS. What about when they don\'t match?' },
      { level: 3, content: 'When they don\'t match, try skipping text1[i] or skipping text2[j], take the maximum.' },
      { level: 4, content: 'This has overlapping subproblems. Use DP with a 2D table dp[i][j].' },
      { level: 5, content: 'dp[i][j] = LCS of text1[0..i-1] and text2[0..j-1].' },
      { level: 6, content: 'If match: dp[i][j] = dp[i-1][j-1] + 1. If no match: dp[i][j] = max(dp[i-1][j], dp[i][j-1]).' },
    ],
    edgeCases: ['Empty strings', 'Single characters', 'Identical strings', 'No common characters', 'Repeated characters'],
    isPublished: true,
  },
  {
    title: 'Number of Islands',
    slug: 'number-of-islands',
    statement: `Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands.

An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of the grid are surrounded by water.`,
    inputDescription: 'A 2D grid of characters where "1" represents land and "0" represents water.',
    outputDescription: 'The number of islands in the grid.',
    constraints: [
      'm == grid.length',
      'n == grid[i].length',
      '1 <= m, n <= 300',
      "grid[i][j] is '0' or '1'",
    ],
    examples: [
      {
        input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]',
        output: '1',
        explanation: 'All land cells are connected, forming one island.',
      },
      {
        input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]',
        output: '3',
        explanation: 'Three separate islands.',
      },
      {
        input: 'grid = [["0","0","0"],["0","0","0"]]',
        output: '0',
        explanation: 'No land, no islands.',
      },
    ],
    difficulty: 'Moderate',
    topic: 'Graphs',
    secondaryTopics: ['BFS', 'DFS'],
    patterns: ['DFS/BFS Graph Traversal', 'Island Problems'],
    tags: ['graph', 'dfs', 'bfs', 'island', 'matrix'],
    companies: ['Amazon', 'Google', 'Facebook', 'Microsoft'],
    starterCode: `public class Main {
    public static int numIslands(char[][] grid) {
        // Write your solution here
        
        return 0;
    }

    public static void main(String[] args) {
    }
}`,
    functionSignature: 'public static int numIslands(char[][] grid)',
    timeLimit: 2,
    memoryLimit: 256,
    visibleTestCases: [
      { input: '4 5\n1 1 1 1 0\n1 1 0 1 0\n1 1 0 0 0\n0 0 0 0 0', expectedOutput: '1', category: 'One Island' },
      { input: '4 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1', expectedOutput: '3', category: 'Three Islands' },
      { input: '2 3\n0 0 0\n0 0 0', expectedOutput: '0', category: 'No Islands' },
    ],
    hiddenTestCases: [
      { input: '1 1\n1', expectedOutput: '1', category: 'Single Land' },
      { input: '1 1\n0', expectedOutput: '0', category: 'Single Water' },
      { input: '3 3\n1 0 1\n0 0 0\n1 0 1', expectedOutput: '4', category: 'Separate Corners' },
      { input: '1 4\n1 1 1 1', expectedOutput: '1', category: 'Row Island' },
      { input: '4 1\n1\n1\n1\n1', expectedOutput: '1', category: 'Column Island' },
    ],
    bruteForceApproach: 'Same as optimal. DFS/BFS is the natural approach.',
    optimalApproach: 'O(m*n): DFS from each unvisited land cell. Mark visited cells to avoid re-visiting. Each DFS start = one island.',
    solution: `public static int numIslands(char[][] grid) {
    int count = 0;
    for (int i = 0; i < grid.length; i++) {
        for (int j = 0; j < grid[0].length; j++) {
            if (grid[i][j] == '1') {
                dfs(grid, i, j);
                count++;
            }
        }
    }
    return count;
}

private static void dfs(char[][] grid, int i, int j) {
    if (i < 0 || i >= grid.length || j < 0 || j >= grid[0].length || grid[i][j] != '1') return;
    grid[i][j] = '0'; // mark visited
    dfs(grid, i+1, j);
    dfs(grid, i-1, j);
    dfs(grid, i, j+1);
    dfs(grid, i, j-1);
}`,
    explanation: 'Iterate through each cell. When we find unvisited land (\'1\'), increment count and use DFS to mark all connected land cells as visited (\'0\'). Each DFS invocation represents one complete island.',
    hints: [
      { level: 1, content: 'An island is a group of connected \'1\' cells. How can you explore a group of connected cells?' },
      { level: 2, content: 'DFS or BFS can explore connected components. Start from any unvisited \'1\' cell.' },
      { level: 3, content: 'After exploring an entire island, mark all its cells as visited so you don\'t count them again.' },
      { level: 4, content: 'Use the grid itself for marking: change \'1\' to \'0\' (or \'#\') when visited.' },
      { level: 5, content: 'DFS explores all 4 directions (up, down, left, right). Stop when out of bounds or cell is not \'1\'.' },
      { level: 6, content: 'Count becomes the number of times you start a new DFS from an unvisited \'1\'.' },
    ],
    edgeCases: ['All water', 'All land (1 island)', 'Single cell', 'Row of land', 'Column of land', 'Diagonal islands'],
    isPublished: true,
  },
  {
    title: 'Coin Change',
    slug: 'coin-change',
    statement: `You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.

Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.

You may assume that you have an infinite number of each kind of coin.`,
    inputDescription: 'An integer array coins and an integer amount.',
    outputDescription: 'Minimum number of coins needed to make amount, or -1 if impossible.',
    constraints: [
      '1 <= coins.length <= 12',
      '1 <= coins[i] <= 2^31 - 1',
      '0 <= amount <= 10^4',
    ],
    examples: [
      { input: 'coins = [1, 2, 5], amount = 11', output: '3', explanation: '11 = 5 + 5 + 1 = 3 coins.' },
      { input: 'coins = [2], amount = 3', output: '-1', explanation: 'Cannot make 3 with coins of denomination 2.' },
      { input: 'coins = [1], amount = 0', output: '0', explanation: '0 amount needs 0 coins.' },
    ],
    difficulty: 'Moderate',
    topic: 'Dynamic Programming',
    secondaryTopics: ['Greedy', 'BFS'],
    patterns: ['Bottom-Up DP', 'Unbounded Knapsack'],
    tags: ['dp', 'coin-change', 'greedy', 'bfs', 'knapsack'],
    companies: ['Amazon', 'Google', 'Facebook', 'Uber'],
    starterCode: `public class Main {
    public static int coinChange(int[] coins, int amount) {
        // Write your solution here
        
        return -1;
    }

    public static void main(String[] args) {
    }
}`,
    functionSignature: 'public static int coinChange(int[] coins, int amount)',
    timeLimit: 2,
    memoryLimit: 256,
    visibleTestCases: [
      { input: '1 2 5\n11', expectedOutput: '3', category: 'Basic' },
      { input: '2\n3', expectedOutput: '-1', category: 'Impossible' },
      { input: '1\n0', expectedOutput: '0', category: 'Zero Amount' },
    ],
    hiddenTestCases: [
      { input: '1\n1', expectedOutput: '1', category: 'Single Coin' },
      { input: '1 5 10 25\n30', expectedOutput: '2', category: 'Standard Coins' },
      { input: '2 5 10\n3', expectedOutput: '-1', category: 'Impossible 2' },
      { input: '186 419 83 408\n6249', expectedOutput: '20', category: 'Large' },
      { input: '1\n10000', expectedOutput: '10000', category: 'Max Amount' },
    ],
    bruteForceApproach: 'O(S^n): Try all combinations recursively.',
    optimalApproach: 'O(S*n): Bottom-up DP. dp[i] = minimum coins to make amount i. dp[0] = 0. For each amount, try each coin.',
    solution: `public static int coinChange(int[] coins, int amount) {
    int[] dp = new int[amount + 1];
    java.util.Arrays.fill(dp, amount + 1);
    dp[0] = 0;
    for (int i = 1; i <= amount; i++) {
        for (int coin : coins) {
            if (coin <= i) {
                dp[i] = Math.min(dp[i], dp[i - coin] + 1);
            }
        }
    }
    return dp[amount] > amount ? -1 : dp[amount];
}`,
    explanation: 'dp[i] = minimum coins to make amount i. Initialize with infinity (amount+1). dp[0] = 0. For each amount from 1 to target, try each coin and take minimum.',
    hints: [
      { level: 1, content: 'This is an optimization problem. Think about building the answer for smaller amounts first.' },
      { level: 2, content: 'If you know the minimum coins for all amounts less than i, can you compute dp[i]?' },
      { level: 3, content: 'For amount i, try each coin c. If c <= i, then dp[i] = min(dp[i], dp[i-c] + 1).' },
      { level: 4, content: 'Initialize dp[0] = 0 and dp[i] = infinity for all other amounts.' },
      { level: 5, content: 'Use a sentinel value like (amount+1) for infinity. After filling dp, check if dp[amount] > amount.' },
      { level: 6, content: 'Two nested loops: outer for amounts 1..amount, inner for each coin. Bottom-up DP.' },
    ],
    edgeCases: ['Amount = 0', 'Impossible amount', 'Large amount', 'Single coin', 'Coins larger than amount'],
    isPublished: true,
  },
  {
    title: 'Group Anagrams',
    slug: 'group-anagrams',
    statement: `Given an array of strings strs, group the anagrams together. You can return the answer in any order.

An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.`,
    inputDescription: 'An array of lowercase English strings.',
    outputDescription: 'A list of groups where each group contains all anagrams from the input.',
    constraints: [
      '1 <= strs.length <= 10^4',
      '0 <= strs[i].length <= 100',
      'strs[i] consists of lowercase English letters',
    ],
    examples: [
      { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]', explanation: '"eat", "tea", "ate" are anagrams. "tan", "nat" are anagrams.' },
      { input: 'strs = [""]', output: '[[""]]', explanation: 'Single empty string.' },
      { input: 'strs = ["a"]', output: '[["a"]]', explanation: 'Single character.' },
    ],
    difficulty: 'Moderate',
    topic: 'Hashing',
    secondaryTopics: ['Sorting', 'Strings'],
    patterns: ['Hash Map Grouping'],
    tags: ['hash-map', 'string', 'anagram', 'grouping'],
    companies: ['Amazon', 'Google', 'Facebook', 'Uber'],
    starterCode: `import java.util.*;

public class Main {
    public static List<List<String>> groupAnagrams(String[] strs) {
        // Write your solution here
        
        return new ArrayList<>();
    }

    public static void main(String[] args) {
    }
}`,
    functionSignature: 'public static List<List<String>> groupAnagrams(String[] strs)',
    timeLimit: 2,
    memoryLimit: 256,
    visibleTestCases: [
      { input: 'eat tea tan ate nat bat', expectedOutput: 'bat|nat tan|ate eat tea', category: 'Basic' },
      { input: '', expectedOutput: '', category: 'Empty String' },
      { input: 'a', expectedOutput: 'a', category: 'Single Char' },
    ],
    hiddenTestCases: [
      { input: 'abc bca cab xyz', expectedOutput: 'xyz|abc bca cab', category: 'Two Groups' },
      { input: 'a b c', expectedOutput: 'a|b|c', category: 'No Anagrams' },
      { input: 'ab ba ab', expectedOutput: 'ab ba ab', category: 'Repeated' },
    ],
    bruteForceApproach: 'O(n * k log k): For each string, sort it and use as key for grouping.',
    optimalApproach: 'O(n * k): Use character frequency array as key instead of sorting.',
    solution: `public static List<List<String>> groupAnagrams(String[] strs) {
    Map<String, List<String>> map = new HashMap<>();
    for (String str : strs) {
        char[] chars = str.toCharArray();
        Arrays.sort(chars);
        String key = new String(chars);
        map.computeIfAbsent(key, k -> new ArrayList<>()).add(str);
    }
    return new ArrayList<>(map.values());
}`,
    explanation: 'Sort each string to get its canonical form. Strings with the same sorted form are anagrams. Group them using a HashMap with sorted string as key.',
    hints: [
      { level: 1, content: 'Anagrams have the same characters, just in different order. How can you identify anagrams?' },
      { level: 2, content: 'Sort each string. Anagrams will produce the same sorted string.' },
      { level: 3, content: 'Use the sorted string as a key in a HashMap to group anagrams together.' },
      { level: 4, content: 'Map<String, List<String>> where key = sorted version of string.' },
      { level: 5, content: 'Use computeIfAbsent to handle new keys elegantly.' },
      { level: 6, content: 'Return new ArrayList<>(map.values()) to get all groups.' },
    ],
    edgeCases: ['Empty strings', 'Single characters', 'All same string', 'No anagrams', 'All are anagrams'],
    isPublished: true,
  },
  {
    title: 'Climbing Stairs',
    slug: 'climbing-stairs',
    statement: `You are climbing a staircase. It takes n steps to reach the top.

Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?`,
    inputDescription: 'An integer n representing the number of stairs.',
    outputDescription: 'The number of distinct ways to climb to the top.',
    constraints: ['1 <= n <= 45'],
    examples: [
      { input: 'n = 2', output: '2', explanation: '1+1 or 2.' },
      { input: 'n = 3', output: '3', explanation: '1+1+1, 1+2, 2+1.' },
      { input: 'n = 1', output: '1', explanation: 'Only one way: single step.' },
    ],
    difficulty: 'Easy',
    topic: 'Dynamic Programming',
    secondaryTopics: ['Recursion', 'Fibonacci'],
    patterns: ['Fibonacci DP'],
    tags: ['dp', 'fibonacci', 'recursion', 'stairs'],
    companies: ['Google', 'Amazon', 'Apple'],
    starterCode: `public class Main {
    public static int climbStairs(int n) {
        // Write your solution here
        
        return 0;
    }
}`,
    functionSignature: 'public static int climbStairs(int n)',
    timeLimit: 2,
    memoryLimit: 256,
    visibleTestCases: [
      { input: '2', expectedOutput: '2', category: 'Basic' },
      { input: '3', expectedOutput: '3', category: 'Basic' },
      { input: '1', expectedOutput: '1', category: 'Single' },
    ],
    hiddenTestCases: [
      { input: '4', expectedOutput: '5', category: 'Four Steps' },
      { input: '5', expectedOutput: '8', category: 'Five Steps' },
      { input: '10', expectedOutput: '89', category: 'Ten Steps' },
      { input: '45', expectedOutput: '1836311903', category: 'Max' },
    ],
    bruteForceApproach: 'O(2^n): Recursive with overlapping subproblems.',
    optimalApproach: 'O(n): Fibonacci DP. dp[n] = dp[n-1] + dp[n-2].',
    solution: `public static int climbStairs(int n) {
    if (n <= 2) return n;
    int a = 1, b = 2;
    for (int i = 3; i <= n; i++) {
        int c = a + b;
        a = b;
        b = c;
    }
    return b;
}`,
    explanation: 'The number of ways to reach step n equals the number of ways to reach n-1 (take 1 step) plus n-2 (take 2 steps). This is the Fibonacci sequence. We optimize space to O(1) by keeping only the last two values.',
    hints: [
      { level: 1, content: 'To reach step n, you could have come from step n-1 or step n-2. Think recursively.' },
      { level: 2, content: 'ways(n) = ways(n-1) + ways(n-2). This is exactly the Fibonacci sequence!' },
      { level: 3, content: 'Pure recursion has O(2^n) time due to overlapping subproblems. Use memoization or DP.' },
      { level: 4, content: 'DP: dp[1]=1, dp[2]=2. For i>=3: dp[i] = dp[i-1] + dp[i-2].' },
      { level: 5, content: 'You only need the last two values, so use O(1) space.' },
      { level: 6, content: 'Iterate from 3 to n, tracking a=prev-prev and b=prev. Return b at the end.' },
    ],
    edgeCases: ['n=1', 'n=2', 'n=45 (maximum)', 'Large n approaching integer limits'],
    isPublished: true,
  },
  {
    title: 'Search in Rotated Sorted Array',
    slug: 'search-rotated-sorted-array',
    statement: `There is an integer array nums sorted in ascending order (with distinct values). Prior to being passed to your function, nums is possibly rotated at an unknown pivot index k.

Given the array nums after the possible rotation and an integer target, return the index of target if it is in nums, or -1 if it is not.

You must write an algorithm with O(log n) runtime complexity.`,
    inputDescription: 'A rotated sorted array of distinct integers and a target integer.',
    outputDescription: 'Index of target or -1 if not found.',
    constraints: [
      '1 <= nums.length <= 5000',
      '-10^4 <= nums[i] <= 10^4',
      'All values are unique',
      'nums is sorted and possibly rotated',
    ],
    examples: [
      { input: 'nums = [4,5,6,7,0,1,2], target = 0', output: '4', explanation: '0 is at index 4.' },
      { input: 'nums = [4,5,6,7,0,1,2], target = 3', output: '-1', explanation: '3 is not in the array.' },
      { input: 'nums = [1], target = 0', output: '-1', explanation: 'Single element, not found.' },
    ],
    difficulty: 'Moderate',
    topic: 'Binary Search',
    secondaryTopics: ['Arrays'],
    patterns: ['Modified Binary Search'],
    tags: ['binary-search', 'rotated', 'sorted', 'array'],
    companies: ['Amazon', 'Google', 'Facebook', 'Microsoft'],
    starterCode: `public class Main {
    public static int search(int[] nums, int target) {
        // Write your solution here
        
        return -1;
    }
}`,
    functionSignature: 'public static int search(int[] nums, int target)',
    timeLimit: 2,
    memoryLimit: 256,
    visibleTestCases: [
      { input: '4 5 6 7 0 1 2\n0', expectedOutput: '4', category: 'Basic' },
      { input: '4 5 6 7 0 1 2\n3', expectedOutput: '-1', category: 'Not Found' },
      { input: '1\n0', expectedOutput: '-1', category: 'Single' },
    ],
    hiddenTestCases: [
      { input: '1 3\n3', expectedOutput: '1', category: 'Two Elements' },
      { input: '3 1\n1', expectedOutput: '1', category: 'Rotated Two' },
      { input: '6 7 1 2 3 4 5\n6', expectedOutput: '0', category: 'Start' },
      { input: '6 7 1 2 3 4 5\n5', expectedOutput: '6', category: 'End' },
      { input: '1 2 3 4 5\n3', expectedOutput: '2', category: 'Not Rotated' },
    ],
    bruteForceApproach: 'O(n): Linear scan.',
    optimalApproach: 'O(log n): Modified binary search. In each step, determine which half is sorted and decide which half to search.',
    solution: `public static int search(int[] nums, int target) {
    int left = 0, right = nums.length - 1;
    while (left <= right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] == target) return mid;
        if (nums[left] <= nums[mid]) { // left half sorted
            if (nums[left] <= target && target < nums[mid]) right = mid - 1;
            else left = mid + 1;
        } else { // right half sorted
            if (nums[mid] < target && target <= nums[right]) left = mid + 1;
            else right = mid - 1;
        }
    }
    return -1;
}`,
    explanation: 'In a rotated sorted array, one half is always sorted. If nums[left] <= nums[mid], the left half is sorted. Check if target is in the sorted half; if yes, search there, otherwise search the other half.',
    hints: [
      { level: 1, content: 'You need O(log n), so binary search. But the array is rotated. What changes?' },
      { level: 2, content: 'Even in a rotated array, at least one half is always sorted around the mid point.' },
      { level: 3, content: 'Determine which half is sorted by comparing nums[left] with nums[mid].' },
      { level: 4, content: 'If nums[left] <= nums[mid], left half is sorted. Check if target is in [left, mid] range.' },
      { level: 5, content: 'If target is in the sorted half, narrow search there. Otherwise search the other half.' },
      { level: 6, content: 'Apply symmetrically for the right half being sorted.' },
    ],
    edgeCases: ['Not rotated', 'Rotated at beginning', 'Rotated at end', 'Target at boundary', 'Single element'],
    isPublished: true,
  },
  {
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring-without-repeating',
    statement: `Given a string s, find the length of the longest substring without repeating characters.`,
    inputDescription: 'A string s.',
    outputDescription: 'Length of the longest substring without repeating characters.',
    constraints: [
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces',
    ],
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: '"abc" has length 3.' },
      { input: 's = "bbbbb"', output: '1', explanation: '"b" has length 1.' },
      { input: 's = "pwwkew"', output: '3', explanation: '"wke" has length 3.' },
    ],
    difficulty: 'Moderate',
    topic: 'Sliding Window',
    secondaryTopics: ['Hashing', 'Strings'],
    patterns: ['Sliding Window', 'HashMap'],
    tags: ['sliding-window', 'hash-map', 'string', 'substring'],
    companies: ['Amazon', 'Google', 'Facebook', 'Bloomberg'],
    starterCode: `import java.util.*;

public class Main {
    public static int lengthOfLongestSubstring(String s) {
        // Write your solution here
        
        return 0;
    }
}`,
    functionSignature: 'public static int lengthOfLongestSubstring(String s)',
    timeLimit: 2,
    memoryLimit: 256,
    visibleTestCases: [
      { input: 'abcabcbb', expectedOutput: '3', category: 'Basic' },
      { input: 'bbbbb', expectedOutput: '1', category: 'All Same' },
      { input: 'pwwkew', expectedOutput: '3', category: 'Mixed' },
    ],
    hiddenTestCases: [
      { input: '', expectedOutput: '0', category: 'Empty' },
      { input: ' ', expectedOutput: '1', category: 'Space' },
      { input: 'aab', expectedOutput: '2', category: 'Short' },
      { input: 'dvdf', expectedOutput: '3', category: 'Jump' },
      { input: 'abcdefghij', expectedOutput: '10', category: 'No Repeats' },
    ],
    bruteForceApproach: 'O(n²) or O(n³): Check all substrings for uniqueness.',
    optimalApproach: 'O(n): Sliding window with HashMap storing last seen index. Shrink window when repeat found.',
    solution: `public static int lengthOfLongestSubstring(String s) {
    Map<Character, Integer> map = new HashMap<>();
    int maxLen = 0, left = 0;
    for (int right = 0; right < s.length(); right++) {
        char c = s.charAt(right);
        if (map.containsKey(c) && map.get(c) >= left) {
            left = map.get(c) + 1;
        }
        map.put(c, right);
        maxLen = Math.max(maxLen, right - left + 1);
    }
    return maxLen;
}`,
    explanation: 'Sliding window: left and right pointers. Map stores last seen index of each character. When a repeat is found within the window, jump left past the previous occurrence. Update max length each step.',
    hints: [
      { level: 1, content: 'Think of a window that slides through the string. What property must the window maintain?' },
      { level: 2, content: 'The window should contain no duplicate characters. How do you efficiently check this?' },
      { level: 3, content: 'Use a HashMap to track the last seen index of each character.' },
      { level: 4, content: 'When a duplicate is found at position right, move left to (last_seen_index + 1).' },
      { level: 5, content: 'Make sure left only moves forward: left = Math.max(left, map.get(c) + 1).' },
      { level: 6, content: 'Max length = max(maxLen, right - left + 1) after each step.' },
    ],
    edgeCases: ['Empty string', 'All same characters', 'All unique characters', 'Spaces', 'Single character'],
    isPublished: true,
  },
  {
    title: 'Product of Array Except Self',
    slug: 'product-array-except-self',
    statement: `Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].

The product of any prefix or suffix of nums is guaranteed to fit in a 32-bit integer.

You must write an algorithm that runs in O(n) time and without using the division operation.`,
    inputDescription: 'An integer array nums.',
    outputDescription: 'An array where answer[i] = product of all elements except nums[i].',
    constraints: [
      '2 <= nums.length <= 10^5',
      '-30 <= nums[i] <= 30',
      'The product of any prefix or suffix fits in a 32-bit integer',
    ],
    examples: [
      { input: 'nums = [1,2,3,4]', output: '[24,12,8,6]', explanation: 'Each element is the product of all others.' },
      { input: 'nums = [-1,1,0,-3,3]', output: '[0,0,9,0,0]', explanation: 'Zero causes most products to be 0.' },
      { input: 'nums = [2,3]', output: '[3,2]', explanation: 'Two-element case.' },
    ],
    difficulty: 'Moderate',
    topic: 'Arrays',
    secondaryTopics: ['Prefix Sum'],
    patterns: ['Prefix/Suffix Products'],
    tags: ['array', 'prefix', 'suffix', 'product'],
    companies: ['Amazon', 'Google', 'Facebook', 'Apple'],
    starterCode: `public class Main {
    public static int[] productExceptSelf(int[] nums) {
        // Write your solution here
        
        return new int[]{};
    }
}`,
    functionSignature: 'public static int[] productExceptSelf(int[] nums)',
    timeLimit: 2,
    memoryLimit: 256,
    visibleTestCases: [
      { input: '1 2 3 4', expectedOutput: '24 12 8 6', category: 'Basic' },
      { input: '-1 1 0 -3 3', expectedOutput: '0 0 9 0 0', category: 'With Zero' },
      { input: '2 3', expectedOutput: '3 2', category: 'Two Elements' },
    ],
    hiddenTestCases: [
      { input: '1 1', expectedOutput: '1 1', category: 'All Ones' },
      { input: '0 0', expectedOutput: '0 0', category: 'All Zeros' },
      { input: '2 3 4 5', expectedOutput: '60 40 30 24', category: 'Standard' },
      { input: '-1 -2 -3', expectedOutput: '6 3 2', category: 'Negatives' },
    ],
    bruteForceApproach: 'O(n²): For each position, compute product of all others.',
    optimalApproach: 'O(n): Compute prefix products from left, then multiply by suffix products from right. O(1) extra space.',
    solution: `public static int[] productExceptSelf(int[] nums) {
    int n = nums.length;
    int[] result = new int[n];
    result[0] = 1;
    for (int i = 1; i < n; i++) result[i] = result[i-1] * nums[i-1];
    int right = 1;
    for (int i = n - 1; i >= 0; i--) {
        result[i] *= right;
        right *= nums[i];
    }
    return result;
}`,
    explanation: 'First pass: fill result with prefix products. Second pass: multiply each by suffix product (maintained in variable right). No division, O(1) extra space.',
    hints: [
      { level: 1, content: 'Division is not allowed. Think about prefix and suffix products.' },
      { level: 2, content: 'answer[i] = (product of all nums before i) * (product of all nums after i).' },
      { level: 3, content: 'Compute prefix products in one pass, then suffix products in another.' },
      { level: 4, content: 'For O(1) extra space, use the output array for prefix products, then multiply suffix products on the fly.' },
      { level: 5, content: 'First loop: result[i] = product of nums[0..i-1]. Second loop (right to left): multiply by suffix product.' },
      { level: 6, content: 'Maintain a running suffix variable. result[i] *= suffix; suffix *= nums[i].' },
    ],
    edgeCases: ['Zeros in array', 'Multiple zeros', 'Negative numbers', 'Two elements', 'All ones'],
    isPublished: true,
  },
  {
    title: 'Find Minimum in Rotated Sorted Array',
    slug: 'find-minimum-rotated-sorted-array',
    statement: `Suppose an array of length n sorted in ascending order is rotated between 1 and n times.

Given the sorted rotated array nums of unique elements, return the minimum element of this array.

You must write an algorithm that runs in O(log n) time.`,
    inputDescription: 'A rotated sorted array of unique integers.',
    outputDescription: 'The minimum element in the array.',
    constraints: [
      'n == nums.length',
      '1 <= n <= 5000',
      '-5000 <= nums[i] <= 5000',
      'All the integers are unique',
      'nums is sorted and rotated between 1 and n times',
    ],
    examples: [
      { input: 'nums = [3,4,5,1,2]', output: '1', explanation: 'Original [1,2,3,4,5] rotated 3 times.' },
      { input: 'nums = [4,5,6,7,0,1,2]', output: '0', explanation: 'Original [0,1,2,4,5,6,7] rotated 4 times.' },
      { input: 'nums = [11,13,15,17]', output: '11', explanation: 'Not rotated, minimum is first element.' },
    ],
    difficulty: 'Moderate',
    topic: 'Binary Search',
    secondaryTopics: ['Arrays'],
    patterns: ['Modified Binary Search'],
    tags: ['binary-search', 'rotated', 'minimum', 'sorted'],
    companies: ['Amazon', 'Google', 'Facebook'],
    starterCode: `public class Main {
    public static int findMin(int[] nums) {
        // Write your solution here
        
        return 0;
    }
}`,
    functionSignature: 'public static int findMin(int[] nums)',
    timeLimit: 2,
    memoryLimit: 256,
    visibleTestCases: [
      { input: '3 4 5 1 2', expectedOutput: '1', category: 'Basic' },
      { input: '4 5 6 7 0 1 2', expectedOutput: '0', category: 'Basic 2' },
      { input: '11 13 15 17', expectedOutput: '11', category: 'Not Rotated' },
    ],
    hiddenTestCases: [
      { input: '1', expectedOutput: '1', category: 'Single' },
      { input: '2 1', expectedOutput: '1', category: 'Two Elements' },
      { input: '1 2 3 4 5', expectedOutput: '1', category: 'No Rotation' },
      { input: '5 4 3 2 1', expectedOutput: '1', category: 'Full Rotation' },
    ],
    bruteForceApproach: 'O(n): Linear scan.',
    optimalApproach: 'O(log n): Binary search. The minimum is at the inflection point where nums[mid] > nums[right].',
    solution: `public static int findMin(int[] nums) {
    int left = 0, right = nums.length - 1;
    while (left < right) {
        int mid = left + (right - left) / 2;
        if (nums[mid] > nums[right]) left = mid + 1;
        else right = mid;
    }
    return nums[left];
}`,
    explanation: 'If nums[mid] > nums[right], the minimum is in the right half. Otherwise, minimum is in the left half (including mid). Binary search converges to the minimum.',
    hints: [
      { level: 1, content: 'O(log n) means binary search. How does rotation affect where the minimum can be?' },
      { level: 2, content: 'Compare nums[mid] with nums[right]. What does each comparison tell you?' },
      { level: 3, content: 'If nums[mid] > nums[right], there\'s a rotation point in the right half (minimum is there).' },
      { level: 4, content: 'If nums[mid] <= nums[right], the right half is sorted, minimum is in left half (or is mid).' },
      { level: 5, content: 'Set left = mid + 1 or right = mid accordingly. Loop while left < right.' },
      { level: 6, content: 'Return nums[left] when loop ends.' },
    ],
    edgeCases: ['Single element', 'Two elements', 'Not rotated', 'Rotated once', 'Fully reversed'],
    isPublished: true,
  },
  {
    title: 'Trapping Rain Water',
    slug: 'trapping-rain-water',
    statement: `Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.`,
    inputDescription: 'An array height where height[i] represents the elevation at position i.',
    outputDescription: 'Total water trapped between the elevation bars.',
    constraints: [
      'n == height.length',
      '1 <= n <= 2 * 10^4',
      '0 <= height[i] <= 10^5',
    ],
    examples: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6', explanation: '6 units of rain water are trapped.' },
      { input: 'height = [4,2,0,3,2,5]', output: '9', explanation: '9 units trapped.' },
      { input: 'height = [1,0,1]', output: '1', explanation: '1 unit trapped in the valley.' },
    ],
    difficulty: 'Hard',
    topic: 'Two Pointers',
    secondaryTopics: ['Arrays', 'Stack'],
    patterns: ['Two Pointers', 'Left-Right Scan'],
    tags: ['two-pointers', 'array', 'water', 'hard'],
    companies: ['Amazon', 'Google', 'Facebook', 'Bloomberg'],
    starterCode: `public class Main {
    public static int trap(int[] height) {
        // Write your solution here
        
        return 0;
    }
}`,
    functionSignature: 'public static int trap(int[] height)',
    timeLimit: 2,
    memoryLimit: 256,
    visibleTestCases: [
      { input: '0 1 0 2 1 0 1 3 2 1 2 1', expectedOutput: '6', category: 'Classic' },
      { input: '4 2 0 3 2 5', expectedOutput: '9', category: 'Standard' },
      { input: '1 0 1', expectedOutput: '1', category: 'Simple' },
    ],
    hiddenTestCases: [
      { input: '3 0 2 0 4', expectedOutput: '7', category: 'Mixed' },
      { input: '1 2 3 4 5', expectedOutput: '0', category: 'Increasing' },
      { input: '5 4 3 2 1', expectedOutput: '0', category: 'Decreasing' },
      { input: '0 0 0', expectedOutput: '0', category: 'All Zero' },
      { input: '5 5 5', expectedOutput: '0', category: 'All Same' },
    ],
    bruteForceApproach: 'O(n²): For each position, find max left and max right, water = min(maxL, maxR) - height[i].',
    optimalApproach: 'O(n): Two-pointer approach. Maintain maxLeft and maxRight. Move the pointer with smaller max.',
    solution: `public static int trap(int[] height) {
    int left = 0, right = height.length - 1;
    int maxLeft = 0, maxRight = 0, water = 0;
    while (left < right) {
        if (height[left] < height[right]) {
            if (height[left] >= maxLeft) maxLeft = height[left];
            else water += maxLeft - height[left];
            left++;
        } else {
            if (height[right] >= maxRight) maxRight = height[right];
            else water += maxRight - height[right];
            right--;
        }
    }
    return water;
}`,
    explanation: 'Two pointers from both ends. The side with smaller height determines water trapped. Water at each position = max_seen_from_that_side - current_height. Move the pointer with smaller max.',
    hints: [
      { level: 1, content: 'Water trapped at position i depends on the minimum of max height to its left and right.' },
      { level: 2, content: 'Brute force: for each i, scan left for maxLeft and right for maxRight. O(n²).' },
      { level: 3, content: 'Can you precompute maxLeft and maxRight arrays? That gives O(n) time O(n) space.' },
      { level: 4, content: 'Can you do O(n) time O(1) space with two pointers?' },
      { level: 5, content: 'Two pointers: if height[left] < height[right], the left side determines trapped water there.' },
      { level: 6, content: 'Move left pointer when maxLeft <= maxRight, else move right. Add trapped water at each step.' },
    ],
    edgeCases: ['All same height (no water)', 'Monotonic increase/decrease', 'Valley in middle', 'All zeros'],
    isPublished: true,
  },
];

async function seed(): Promise<void> {
  console.log('🌱 Starting database seed...');
  await connectDatabase();

  // Clear existing data
  await User.deleteMany({});
  await Problem.deleteMany({});
  console.log('🗑️  Cleared existing data');

  // Create admin user
  const adminHash = await bcrypt.hash('Admin@12345', 12);
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@example.com',
    passwordHash: adminHash,
    role: 'admin',
    college: 'Platform',
    batch: '2024',
    preferredLanguage: 'java',
  });
  console.log('👤 Created admin: admin@example.com / Admin@12345 (DEVELOPMENT ONLY)');

  // Create student user
  const studentHash = await bcrypt.hash('Student@12345', 12);
  const student = await User.create({
    name: 'Test Student',
    email: 'student@example.com',
    passwordHash: studentHash,
    role: 'student',
    college: 'Test College',
    batch: '2024',
    preferredLanguage: 'java',
  });
  console.log('👤 Created student: student@example.com / Student@12345 (DEVELOPMENT ONLY)');

  // Create problems
  for (const problem of problems) {
    await Problem.create(problem as Parameters<typeof Problem.create>[0]);
    console.log(`✅ Created problem: ${problem.title}`);
  }

  console.log(`\n🎉 Seed complete!`);
  console.log(`   ${problems.length} problems created`);
  console.log(`   2 users created`);
  console.log('\n⚠️  WARNING: Development credentials are hardcoded. Change in production!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
