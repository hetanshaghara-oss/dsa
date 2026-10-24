export interface ProblemMeta {
  companies: string[];
  hints: [string, string, string]; // [Intuition, Approach, Pseudocode]
  timeComplexity: string;
  spaceComplexity: string;
}

export const PROBLEM_METADATA: Record<string, ProblemMeta> = {
  // Day 1
  d1p1: {
    companies: ['Google', 'Meta', 'Amazon', 'Microsoft', 'Bloomberg'],
    hints: [
      'Think about pairing: an opening bracket must be closed by the most recently opened bracket of matching type.',
      'Use a Stack to push opening brackets. When a closing bracket arrives, verify that the top of the stack matches its pair.',
      'If stack is empty on closing bracket or top doesn\'t match, return false. After processing all characters, stack must be completely empty.'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
  },
  d1p2: {
    companies: ['Amazon', 'Meta', 'Microsoft', 'Bloomberg'],
    hints: [
      'Similar to bracket matching, adjacent identical letters cancel each other out in pairs.',
      'Maintain a stack or string builder. For each character, if it equals the current top element, pop it; otherwise push it.',
      'Characters remaining in the stack from bottom to top form the final simplified string.'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
  },

  // Day 2
  d2p1: {
    companies: ['Amazon', 'Microsoft', 'Bloomberg', 'Apple'],
    hints: [
      'You need O(1) retrieval for minimum. Storing just one global min variable fails when the minimum is popped.',
      'Maintain an auxiliary stack where each entry stores the minimum value seen so far up to that depth.',
      'When pushing value x: minStack.push(min(x, minStack.top())). When popping, pop from both main and min stacks.'
    ],
    timeComplexity: 'O(1) per op',
    spaceComplexity: 'O(N)',
  },
  d2p2: {
    companies: ['Microsoft', 'Amazon', 'Apple', 'Bloomberg'],
    hints: [
      'Queues are FIFO (First-In-First-Out), but Stacks are LIFO. Reversing elements twice restores original queue order.',
      'Use two stacks: inStack for pushing new elements, outStack for serving pops/peeks.',
      'When pop/peek is requested and outStack is empty, transfer all elements from inStack to outStack. This yields amortized O(1).'
    ],
    timeComplexity: 'Amortized O(1)',
    spaceComplexity: 'O(N)',
  },

  // Day 3
  d3p1: {
    companies: ['Amazon', 'Microsoft', 'Google', 'LinkedIn'],
    hints: [
      'Reverse Polish Notation (postfix) places operators after their operands. No parentheses are needed.',
      'Iterate through tokens. When encountering a number, push it onto the stack. When encountering an operator, pop the top two numbers.',
      'Caution with order of operands: second pop is the left operand (a), first pop is the right operand (b). Compute a op b and push result.'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
  },
  d3p2: {
    companies: ['Meta', 'Amazon', 'Microsoft', 'Google'],
    hints: [
      'Split the Unix path by "/" delimiters. Ignore empty parts and single dots (".").',
      'Use a stack to keep track of active directory names in the canonical path.',
      'When token is "..", pop from the stack if not empty. Otherwise push valid directory names. Join remaining stack with "/".'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
  },

  // Day 4
  d4p1: {
    companies: ['Amazon', 'Meta', 'Google', 'Apple', 'Bloomberg'],
    hints: [
      'You want to find the distance to the next warmer temperature for every day.',
      'A brute force O(N^2) checks future days. Use a Monotonic Decreasing Stack storing indices.',
      'While current temp > temp[stack.top], pop index prevIdx and set answer[prevIdx] = currentIdx - prevIdx. Then push currentIdx.'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
  },
  d4p2: {
    companies: ['Amazon', 'Bloomberg', 'Microsoft'],
    hints: [
      'Find the next greater element in nums2 for every number in nums1.',
      'Use a monotonic decreasing stack over nums2 and store results in a hash map: value -> next greater value.',
      'Pop elements smaller than current element and record current as their next greater. Unmapped elements have -1.'
    ],
    timeComplexity: 'O(N + M)',
    spaceComplexity: 'O(M)',
  },

  // Day 5
  d5p1: {
    companies: ['Amazon', 'Google', 'Microsoft', 'Adobe'],
    hints: [
      'The span is the maximum number of consecutive days for which the stock price was <= today\'s price.',
      'Maintain a monotonic decreasing stack storing pairs: {price, span}.',
      'While stack is non-empty and stack.top().price <= price, add stack.top().span to today\'s span and pop. Then push {price, totalSpan}.'
    ],
    timeComplexity: 'Amortized O(1)',
    spaceComplexity: 'O(N)',
  },
  d5p2: {
    companies: ['Amazon', 'Microsoft', 'Google'],
    hints: [
      'The array is circular, meaning the search wraps around from the end back to the beginning.',
      'Simulate circular traversal by looping twice through the array (index i from 0 to 2*n - 1) using modulo i % n.',
      'Use a monotonic stack storing indices. Only push indices onto the stack during the first pass (i < n).'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
  },

  // Day 6
  d6p1: {
    companies: ['Amazon', 'Google', 'Meta', 'Microsoft', 'Apple'],
    hints: [
      'For each bar, find how far left and right it can extend as the minimum height.',
      'A bar can extend until it hits a bar shorter than itself on both sides.',
      'Use a monotonic increasing stack. When a shorter bar is encountered, pop and calculate rectangle area with popped height.'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
  },
  d6p2: {
    companies: ['Microsoft', 'Amazon', 'Google'],
    hints: [
      'To make a number smaller, earlier digits should be as small as possible (greedy choice).',
      'If the previous digit is strictly greater than the current digit and k > 0, removing the previous digit yields a smaller number.',
      'Use a monotonic increasing stack. Remove leading zeros from the final result. If empty, return "0".'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
  },

  // Day 7
  d7p1: {
    companies: ['Amazon', 'Meta', 'Google', 'Uber'],
    hints: [
      'Asteroids moving right (+) and then left (-) will collide. Asteroids moving left first never collide with ones behind them.',
      'Collision only happens when stack top > 0 and incoming asteroid < 0.',
      'While stack top > 0 and top < abs(incoming), pop top. If top == abs(incoming), both explode. If top > abs(incoming), incoming explodes.'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
  },
  d7p2: {
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft', 'Bloomberg'],
    hints: [
      'Nested bracket patterns k[string] require evaluating inner strings first before multiplying.',
      'Use two stacks or a stack of pairs: countStack and stringStack.',
      'On "[", push current count and current string. On "]", pop count and append current string multiplied count times to prev string.'
    ],
    timeComplexity: 'O(N * maxK)',
    spaceComplexity: 'O(N)',
  },

  // Day 8 — Queue
  d8p1: {
    companies: ['Amazon', 'Google', 'Microsoft'],
    hints: [
      'Track requests within the last 3000 milliseconds ([t - 3000, t]).',
      'Timestamps arrive in strictly increasing order. Older timestamps outside the window will never be needed again.',
      'Push t into a queue. While queue.front() < t - 3000, pop from queue. The queue size is the answer.'
    ],
    timeComplexity: 'Amortized O(1)',
    spaceComplexity: 'O(W)',
  },
  d8p2: {
    companies: ['Google', 'Meta', 'Amazon', 'Bloomberg'],
    hints: [
      'Calculate moving average of the last `size` integers in a stream.',
      'Use a queue of capacity `size` and maintain a running sum variable.',
      'When queue reaches capacity, subtract queue.front() from sum and pop. Add new value to sum and queue. Return sum / queue.size().'
    ],
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(size)',
  },

  // Day 9
  d9p1: {
    companies: ['Google', 'Amazon', 'Apple'],
    hints: [
      'Design a circular queue with fixed size without allocating dynamic memory.',
      'Use a fixed-size vector and two pointers: head and tail, plus a size counter.',
      'Update pointers using modulo arithmetic: (head + 1) % capacity and (tail + 1) % capacity.'
    ],
    timeComplexity: 'O(1) all ops',
    spaceComplexity: 'O(K)',
  },
  d9p2: {
    companies: ['Meta', 'Amazon', 'Microsoft'],
    hints: [
      'Stack is LIFO, Queue is FIFO. Pushing to a queue and rotating puts the newest element at the front.',
      'Can be implemented with a single queue: push element x, then for size - 1 times, pop the front and push it back to the rear.',
      'Now the newly added element sits at the front, ready for pop() or top() in O(1).'
    ],
    timeComplexity: 'O(N) push, O(1) pop',
    spaceComplexity: 'O(N)',
  },

  // Day 10
  d10p1: {
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta', 'Apple'],
    hints: [
      'Find maximum in each sliding window of size k in O(N) total time.',
      'Use a Monotonic Deque storing indices. Maintain elements in decreasing order of value.',
      'Pop elements out of window (index <= i - k) from front. Pop elements smaller than nums[i] from back. Front is window max.'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(K)',
  },
  d10p2: {
    companies: ['Amazon', 'Microsoft', 'Uber'],
    hints: [
      'First unique character in a stream of characters.',
      'Keep a frequency array/hashmap (size 26) and a queue of characters in arrival order.',
      'When querying the first unique, pop from the queue while queue.front() has frequency > 1. If queue empty, return "#".'
    ],
    timeComplexity: 'Amortized O(1)',
    spaceComplexity: 'O(26)',
  },

  // Day 11
  d11p1: {
    companies: ['Google', 'Meta', 'Amazon', 'Microsoft', 'Apple'],
    hints: [
      'Gas station circular tour: can you complete the circuit without tank falling below 0?',
      'If total gas < total cost, completion is impossible. Return -1.',
      'Greedy observation: if starting at A cannot reach B, no station between A and B can reach B either. Reset start to B + 1.'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
  },
  d11p2: {
    companies: ['Google', 'Meta', 'Amazon'],
    hints: [
      'Find shortest subarray with sum >= k containing possibly negative numbers.',
      'Compute prefix sums. We need P[j] - P[i] >= k with minimum j - i.',
      'Use a Monotonic Deque storing indices i with increasing prefix sums P[i].'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
  },

  // Day 12
  d12p1: {
    companies: ['Amazon', 'Microsoft', 'Google'],
    hints: [
      'Design double-ended queue supporting insertion/deletion at both ends.',
      'Use a circular array with head and tail pointers and modulo arithmetic.',
      'Index wrap: (head - 1 + capacity) % capacity for front insertion.'
    ],
    timeComplexity: 'O(1) all ops',
    spaceComplexity: 'O(K)',
  },
  d12p2: {
    companies: ['Amazon', 'Meta', 'Microsoft'],
    hints: [
      'Find longest continuous subarray where max - min <= limit.',
      'Use two deques: maxDeque (decreasing values) and minDeque (increasing values) over sliding window [L, R].',
      'When maxDeque.front() - minDeque.front() > limit, increment L and evict indices smaller than L.'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(N)',
  },

  // Day 13
  d13p1: {
    companies: ['Google', 'Meta', 'Amazon', 'Microsoft'],
    hints: [
      '2x2 grid sliding puzzle with digits 1-5 and 0 (empty). Minimum moves to reach target "123450".',
      'This is finding the shortest path in an unweighted state graph — BFS is optimal.',
      'Represent state as a string. Maintain queue and visited set. Swap 0 with adjacent board positions.'
    ],
    timeComplexity: 'O(6!)',
    spaceComplexity: 'O(6!)',
  },
  d13p2: {
    companies: ['Amazon', 'Meta', 'Bloomberg'],
    hints: [
      'Find nearest 0 for every cell in a binary matrix.',
      'Instead of BFS from each 1 (too slow), start multi-source BFS simultaneously from all 0 cells.',
      'Initialize queue with all 0 coordinates (distance 0). Expand to 4-directional neighbors.'
    ],
    timeComplexity: 'O(R * C)',
    spaceComplexity: 'O(R * C)',
  },

  // Day 14
  d14p1: {
    companies: ['Amazon', 'Microsoft', 'Bloomberg', 'Uber'],
    hints: [
      'Rotting oranges spread to adjacent fresh oranges every minute.',
      'Multi-source BFS: add all initially rotten oranges to queue at minute 0.',
      'Process level by level. Decrement fresh orange count. If fresh count == 0, return elapsed minutes.'
    ],
    timeComplexity: 'O(R * C)',
    spaceComplexity: 'O(R * C)',
  },
  d14p2: {
    companies: ['Amazon', 'Microsoft', 'Google'],
    hints: [
      'Two friends play elimination counting game on a circle (Josephus problem).',
      'Simulation with queue: push 1..n. For each step, pop and re-enqueue k - 1 times, then pop the k-th person.',
      'Mathematical recurrence for O(N): f(n, k) = (f(n - 1, k) + k) % n with f(1, k) = 0.'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
  },

  // Day 15 — Linked List
  d15p1: {
    companies: ['Amazon', 'Meta', 'Apple', 'Microsoft', 'Google'],
    hints: [
      'Reverse singly linked list in-place.',
      'Maintain three pointers: prev (null), curr (head), and nextNode.',
      'Loop: nextNode = curr.next; curr.next = prev; prev = curr; curr = nextNode; Return prev.'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
  },
  d15p2: {
    companies: ['Amazon', 'Microsoft', 'Meta', 'Apple'],
    hints: [
      'Find the middle node of a linked list in one pass.',
      'Use the Two-Pointer Fast and Slow pattern (Floyd\'s algorithm).',
      'Slow moves 1 step, fast moves 2 steps. When fast reaches end or null, slow is at the middle.'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
  },

  // Day 16
  d16p1: {
    companies: ['Amazon', 'Microsoft', 'Apple', 'Google', 'Meta'],
    hints: [
      'Merge two sorted linked lists into one sorted list.',
      'Use a dummy head node to simplify edge cases.',
      'Compare list1.val and list2.val, attach the smaller node to tail, advance that list pointer.'
    ],
    timeComplexity: 'O(N + M)',
    spaceComplexity: 'O(1)',
  },
  d16p2: {
    companies: ['Amazon', 'Microsoft', 'Meta'],
    hints: [
      'Remove all instances of val from linked list.',
      'Create dummy node pointing to head to handle removing head node easily.',
      'Iterate: if curr.next.val == val, curr.next = curr.next.next; otherwise curr = curr.next.'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
  },

  // Day 17
  d17p1: {
    companies: ['Amazon', 'Microsoft', 'Meta', 'Google'],
    hints: [
      'Detect if a cycle exists in the linked list.',
      'Fast and Slow pointers (Tortoise and Hare).',
      'If fast or fast.next is null, no cycle exists. If slow == fast at any point, a cycle exists.'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
  },
  d17p2: {
    companies: ['Amazon', 'Microsoft', 'Meta'],
    hints: [
      'Find the node where the cycle begins.',
      'First detect meeting point of slow and fast pointers.',
      'Reset slow to head. Move both slow and fast 1 step at a time. The node where they meet is the cycle start.'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
  },

  // Day 18
  d18p1: {
    companies: ['Amazon', 'Microsoft', 'Apple', 'Google'],
    hints: [
      'Remove n-th node from end of list in one pass.',
      'Dummy node and two pointers fast and slow spaced n steps apart.',
      'Advance fast n steps ahead. Then move both until fast reaches the end. slow.next is the node to delete.'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
  },
  d18p2: {
    companies: ['Amazon', 'Meta', 'Microsoft', 'Apple'],
    hints: [
      'Check if linked list reads the same backwards as forwards.',
      'Find middle using slow & fast pointers, then reverse the second half of the list in-place.',
      'Compare the first half and reversed second half node-by-node.'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
  },

  // Day 19
  d19p1: {
    companies: ['Amazon', 'Microsoft', 'Apple', 'Bloomberg'],
    hints: [
      'Find intersection node of two singly linked lists.',
      'Two pointers ptrA and ptrB. When ptrA hits end of A, redirect to head of B (and vice versa).',
      'Both pointers travel lenA + lenB and meet at intersection node or null.'
    ],
    timeComplexity: 'O(N + M)',
    spaceComplexity: 'O(1)',
  },
  d19p2: {
    companies: ['Amazon', 'Microsoft', 'Bloomberg'],
    hints: [
      'Delete node without reference to head (only given pointer to node itself).',
      'Copy the value of node.next into node: node.val = node.next.val.',
      'Bypass the next node: node.next = node.next.next.'
    ],
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
  },

  // Day 20
  d20p1: {
    companies: ['Amazon', 'Microsoft', 'Google', 'Meta'],
    hints: [
      'Add two numbers represented as linked lists with digits in reverse order.',
      'Track carry variable initialized to 0. Iterate while l1, l2, or carry exists.',
      'sum = (l1 ? l1.val : 0) + (l2 ? l2.val : 0) + carry. Append new node with sum % 10. carry = sum / 10.'
    ],
    timeComplexity: 'O(max(N, M))',
    spaceComplexity: 'O(max(N, M))',
  },
  d20p2: {
    companies: ['Amazon', 'Microsoft', 'Apple'],
    hints: [
      'Swap adjacent nodes in pairs: 1->2->3->4 becomes 2->1->4->3.',
      'Use dummy node pointing to head to handle head pointer swaps cleanly.',
      'Let first = prev.next, second = prev.next.next. Rewire: first.next = second.next; second.next = first; prev.next = second.'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
  },

  // Day 21
  d21p1: {
    companies: ['Amazon', 'Meta', 'Microsoft', 'Google', 'Apple'],
    hints: [
      'Reverse nodes of a linked list k at a time.',
      'Check if at least k nodes exist from current node. If not, leave remaining nodes as-is.',
      'Reverse k nodes, recursively call on next group, and connect.'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
  },
  d21p2: {
    companies: ['Amazon', 'Microsoft', 'Meta', 'Bloomberg'],
    hints: [
      'Copy list with random pointer where nodes can point anywhere or null.',
      '3-pass interweaving technique: 1) create cloned nodes interleaved after originals: A -> A\' -> B -> B\'.',
      '2) curr.next.random = curr.random ? curr.random.next : null. 3) Separate original and cloned lists.'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
  },

  // Day 22 — Binary Tree
  d22p1: {
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta', 'Apple'],
    hints: [
      'Inorder traversal: Left subtree -> Root -> Right subtree.',
      'Recursive approach is trivial: traverse(root.left), visit(root), traverse(root.right).',
      'Iterative approach uses a stack: push all left nodes, pop and visit, then move to right child.'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(H)',
  },
  d22p2: {
    companies: ['Amazon', 'Microsoft', 'Google'],
    hints: [
      'Preorder traversal: Root -> Left subtree -> Right subtree.',
      'Iterative: push root onto stack. Pop node, visit it, then push right child first, then left child.',
      'Right child is pushed first so left child is popped and processed first.'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(H)',
  },

  // Day 23
  d23p1: {
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta', 'Apple'],
    hints: [
      'Max depth is the number of nodes along the longest path from root to leaf.',
      'Base case: if root is null, depth is 0.',
      'Recursive relation: return 1 + max(maxDepth(root.left), maxDepth(root.right)).'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(H)',
  },
  d23p2: {
    companies: ['Amazon', 'Microsoft', 'Meta', 'Google'],
    hints: [
      'Invert / flip binary tree so left and right subtrees are swapped at every node.',
      'If root is null, return null.',
      'Swap root.left and root.right, then recursively invert left and right subtrees.'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(H)',
  },

  // Day 24
  d24p1: {
    companies: ['Amazon', 'Meta', 'Microsoft', 'Google'],
    hints: [
      'Symmetric tree is a mirror reflection of itself around its center.',
      'Helper function isMirror(t1, t2). Both null -> true. One null -> false.',
      't1.val == t2.val && isMirror(t1.left, t2.right) && isMirror(t1.right, t2.left).'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(H)',
  },
  d24p2: {
    companies: ['Amazon', 'Microsoft', 'Meta', 'Bloomberg'],
    hints: [
      'Diameter is length of longest path between any two nodes (may or may not pass through root).',
      'At each node, longest path passing through it = height(left) + height(right).',
      'Maintain global max diameter while computing subtree heights recursively.'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(H)',
  },

  // Day 25
  d25p1: {
    companies: ['Amazon', 'Meta', 'Microsoft', 'Google', 'Apple'],
    hints: [
      'Level order traversal (BFS) groups node values level by level from top to bottom.',
      'Use a FIFO queue initialized with root. Loop while queue is non-empty.',
      'Record levelSize = queue.size(). Pop levelSize nodes, record values, and push non-null children.'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(W)',
  },
  d25p2: {
    companies: ['Amazon', 'Microsoft', 'Meta', 'Google'],
    hints: [
      'Zigzag level order alternates left-to-right and right-to-left traversal each level.',
      'Standard BFS with levelSize. Maintain boolean flag leftToRight = true.',
      'Fill current level vector of size levelSize directly at index i or levelSize - 1 - i depending on flag.'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(W)',
  },

  // Day 26
  d26p1: {
    companies: ['Amazon', 'Meta', 'Microsoft', 'Bloomberg'],
    hints: [
      'Check if tree has root-to-leaf path whose node values sum up to targetSum.',
      'Base case: if root is null, return false. If leaf (no children), return root.val == targetSum.',
      'Recurse: hasPathSum(root.left, targetSum - root.val) || hasPathSum(root.right, targetSum - root.val).'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(H)',
  },
  d26p2: {
    companies: ['Amazon', 'Google', 'Microsoft', 'Meta'],
    hints: [
      'Balanced tree: height difference between left and right subtree is at most 1 for every node.',
      'Bottom-up DFS: return -1 if unbalanced; otherwise return actual height.',
      'If leftHeight == -1 or rightHeight == -1 or abs(leftHeight - rightHeight) > 1, return -1.'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(H)',
  },

  // Day 27
  d27p1: {
    companies: ['Amazon', 'Meta', 'Microsoft', 'Google', 'Apple'],
    hints: [
      'Lowest Common Ancestor (LCA) is the lowest node having both p and q as descendants.',
      'If root is null or root == p or root == q, return root.',
      'Recurse on left and right. If both return non-null, root is LCA. If only one is non-null, return it.'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(H)',
  },
  d27p2: {
    companies: ['Amazon', 'Meta', 'Bloomberg'],
    hints: [
      'Right side view: imagine standing on right side of tree, see nodes visible from top to bottom.',
      'BFS approach: in level order traversal, the last element popped in each level belongs to right side view.',
      'Or DFS right-first: if depth == result.size(), add node.val to result.'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(W)',
  },

  // Day 28
  d28p1: {
    companies: ['Amazon', 'Microsoft', 'Meta', 'Bloomberg'],
    hints: [
      'A valid BST satisfies: all left nodes < root < all right nodes for ALL subtrees.',
      'Checking only root.left < root < root.right is a common bug! Range constraints must be passed down.',
      'Helper validate(node, minVal, maxVal). Recurse with (node.left, minVal, node.val) and (node.right, node.val, maxVal).'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(H)',
  },
  d28p2: {
    companies: ['Amazon', 'Google', 'Microsoft', 'Uber'],
    hints: [
      'In a BST, in-order traversal visits nodes in strictly increasing sorted order.',
      'Perform in-order traversal and decrement k on each visit.',
      'When k reaches 0, the current node value is the k-th smallest element. Stop traversal immediately.'
    ],
    timeComplexity: 'O(H + K)',
    spaceComplexity: 'O(H)',
  },

  // Day 29 — Mixed
  d29p1: {
    companies: ['Google', 'Amazon', 'Meta', 'Microsoft', 'Apple'],
    hints: [
      'Find median dynamically as numbers are added to a data stream.',
      'Split numbers into two halves: max-heap for lower half, min-heap for upper half.',
      'Maintain invariant: maxHeap size == minHeap size or maxHeap size == minHeap size + 1. Median is top or avg of tops.'
    ],
    timeComplexity: 'O(log N) add, O(1) find',
    spaceComplexity: 'O(N)',
  },
  d29p2: {
    companies: ['Amazon', 'Microsoft', 'Meta', 'Google'],
    hints: [
      'Sort linked list in O(N log N) time and O(1) auxiliary space.',
      'Merge Sort is ideal for linked lists because splitting and merging nodes requires no extra arrays.',
      'Find mid with slow & fast pointers, disconnect lists, sort halves recursively, then merge sorted lists.'
    ],
    timeComplexity: 'O(N log N)',
    spaceComplexity: 'O(log N) stack',
  },

  // Day 30 — Mixed Final
  d30p1: {
    companies: ['Amazon', 'Microsoft', 'Meta', 'Bloomberg'],
    hints: [
      'Flatten binary tree to linked list in-place according to pre-order traversal.',
      'For any node with a left child, find the rightmost node of its left subtree.',
      'Attach node.right to rightmost node\'s right, then move node.left to node.right and set node.left = null.'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
  },
  d30p2: {
    companies: ['Google', 'Amazon', 'Microsoft', 'Meta'],
    hints: [
      'Implement iterator over in-order traversal of BST with O(1) amortized next() and O(h) memory.',
      'Use an explicit stack storing nodes. In constructor, push root and all its left ancestors.',
      'On next(): pop top node, if it has a right child, push that right child and all its left ancestors. Return popped val.'
    ],
    timeComplexity: 'Amortized O(1)',
    spaceComplexity: 'O(H)',
  },
};

// Fallback metadata generator for any unmapped problem
export function getProblemMetadata(problemId: string): ProblemMeta {
  if (PROBLEM_METADATA[problemId]) {
    return PROBLEM_METADATA[problemId];
  }
  return {
    companies: ['Google', 'Amazon', 'Meta'],
    hints: [
      'Analyze the constraints and identify which data structure (Stack, Queue, Tree) models this problem.',
      'Break the problem down into base cases and recursive or iterative state transitions.',
      'Simulate the algorithm step-by-step on a small test case to verify edge conditions.'
    ],
    timeComplexity: 'O(N)',
    spaceComplexity: 'O(1)',
  };
}
