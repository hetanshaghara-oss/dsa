export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type Topic = 'Stack' | 'Queue' | 'Deque' | 'Linked List' | 'Binary Tree' | 'Mixed';
export type ProblemStatus = 'not-started' | 'attempted' | 'solved' | 'needs-revision';

export interface Problem {
  id: string;
  number?: number;
  title: string;
  difficulty: Difficulty;
  topic: Topic;
  day: number;
  week: number;
  url: string;
  orderInDay: 1 | 2;
}

export interface UserProblemData {
  status: ProblemStatus;
  completedAt?: string; // ISO timestamp
  notes: string;
  needsRevision: boolean;
  personalDifficulty: number; // 1-5
}

export interface DayInfo {
  day: number;
  week: number;
  topic: Topic;
  weekName: string;
  objective: string;
  keyPatterns: string[];
  concept: string;
}

export const WEEKS: { week: number; name: string; topic: Topic; days: number[] }[] = [
  { week: 1, name: 'Week 1 — Stack', topic: 'Stack', days: [1, 2, 3, 4, 5, 6, 7] },
  { week: 2, name: 'Week 2 — Queue & Deque', topic: 'Queue', days: [8, 9, 10, 11, 12, 13, 14] },
  { week: 3, name: 'Week 3 — Linked List', topic: 'Linked List', days: [15, 16, 17, 18, 19, 20, 21] },
  { week: 4, name: 'Week 4 — Binary Tree', topic: 'Binary Tree', days: [22, 23, 24, 25, 26, 27, 28] },
  { week: 5, name: 'Days 29–30 — Mixed Revision', topic: 'Mixed', days: [29, 30] },
];

export const DAY_INFO: DayInfo[] = [
  {
    day: 1, week: 1, topic: 'Stack', weekName: 'Week 1 — Stack',
    objective: 'Learn the fundamentals of Stack (LIFO) and apply it to bracket matching problems.',
    keyPatterns: ['Matching brackets with a stack', 'Adjacent pair elimination', 'LIFO order processing'],
    concept: 'A Stack follows Last-In-First-Out order. Push elements onto the top and pop from the top. Perfect for matching/pairing problems and undo-redo operations.',
  },
  {
    day: 2, week: 1, topic: 'Stack', weekName: 'Week 1 — Stack',
    objective: 'Design stack-based data structures with additional operations.',
    keyPatterns: ['Auxiliary stack for min tracking', 'Amortized operations', 'Simulating queues with two stacks'],
    concept: 'Some problems require augmented stacks that track extra information (like minimum element). Use two stacks to simulate queue behavior — one for enqueue, one for dequeue.',
  },
  {
    day: 3, week: 1, topic: 'Stack', weekName: 'Week 1 — Stack',
    objective: 'Use stack for expression evaluation and path simplification.',
    keyPatterns: ['Operand/operator stack processing', 'Left-to-right evaluation', 'Path segment management'],
    concept: 'Stacks excel at expression parsing. Push operands, pop when you see an operator. For paths, push directory names and pop on ".." to navigate back.',
  },
  {
    day: 4, week: 1, topic: 'Stack', weekName: 'Week 1 — Stack',
    objective: 'Master the Monotonic Stack pattern for next greater element problems.',
    keyPatterns: ['Monotonic decreasing stack', 'Index tracking in stack', 'Backward vs forward iteration'],
    concept: 'Monotonic stacks maintain a sorted order of elements. To find the next greater element, maintain a decreasing stack — when a larger element is found, it resolves all smaller ones still in the stack.',
  },
  {
    day: 5, week: 1, topic: 'Stack', weekName: 'Week 1 — Stack',
    objective: 'Apply monotonic stack to online streaming and circular array problems.',
    keyPatterns: ['Online algorithm design', 'Circular array with modulo', 'Span calculation'],
    concept: 'For circular arrays, iterate 2n times using modulo indexing. For online span calculations, the stack stores (price, span) pairs to aggregate spans efficiently.',
  },
  {
    day: 6, week: 1, topic: 'Stack', weekName: 'Week 1 — Stack',
    objective: 'Tackle hard monotonic stack problems involving histograms and digit manipulation.',
    keyPatterns: ['Histogram bar expansion', 'Greedy digit removal', 'Left boundary tracking'],
    concept: 'For histogram area: for each bar, find the left and right boundaries where the bar height can extend. Use a monotonic stack to compute these in O(n).',
  },
  {
    day: 7, week: 1, topic: 'Stack', weekName: 'Week 1 — Stack',
    objective: 'Finish Week 1 with advanced stack applications in collision simulation and encoding.',
    keyPatterns: ['Collision simulation', 'Nested structure decoding', 'Recursive-like iteration'],
    concept: 'For asteroid collision, compare the top of the stack (going right) with the current asteroid (going left). For decode string, use two stacks — one for counts and one for strings.',
  },
  {
    day: 8, week: 2, topic: 'Queue', weekName: 'Week 2 — Queue & Deque',
    objective: 'Begin Week 2 with Queue fundamentals and sliding window basics.',
    keyPatterns: ['FIFO order', 'Time window using a queue', 'Sliding average maintenance'],
    concept: 'Queue follows First-In-First-Out. Use it to maintain a window of recent elements. For moving average, keep a queue of the last k elements and track their sum.',
  },
  {
    day: 9, week: 2, topic: 'Deque', weekName: 'Week 2 — Queue & Deque',
    objective: 'Design circular queue and deque from scratch.',
    keyPatterns: ['Circular buffer with head/tail pointers', 'Modulo arithmetic', 'Deque double-ended operations'],
    concept: 'Circular queues use a fixed-size array with head/tail pointers that wrap around using modulo. A deque (double-ended queue) supports push/pop from both ends.',
  },
  {
    day: 10, week: 2, topic: 'Queue', weekName: 'Week 2 — Queue & Deque',
    objective: 'Simulate stacks with queues and solve lunch distribution problems.',
    keyPatterns: ['Two-queue simulation', 'Rotation technique', 'Count-based termination'],
    concept: 'Simulating a stack with queues requires rotating elements so the most recently added element is always at the front. Count students who prefer each sandwich type.',
  },
  {
    day: 11, week: 2, topic: 'Queue', weekName: 'Week 2 — Queue & Deque',
    objective: 'Apply queues to greedy simulation and ordering problems.',
    keyPatterns: ['Round-robin simulation', 'Greedy senate voting', 'Card arrangement with queue rotation'],
    concept: 'For senate problems, simulate rounds where each senator bans the next opponent. For reveal cards, simulate the reveal process in reverse using a queue.',
  },
  {
    day: 12, week: 2, topic: 'Deque', weekName: 'Week 2 — Queue & Deque',
    objective: 'Master the Monotonic Deque for sliding window maximum and constraints.',
    keyPatterns: ['Monotonic deque for window max', 'Remove old indices from front', 'Remove smaller elements from back'],
    concept: 'A monotonic deque maintains the maximum (or minimum) in a sliding window. Keep the deque decreasing: remove from back if smaller than current, remove from front if out of window.',
  },
  {
    day: 13, week: 2, topic: 'Deque', weekName: 'Week 2 — Queue & Deque',
    objective: 'Apply deque-based optimization to subarray sum and jump game DP.',
    keyPatterns: ['Prefix sum with deque', 'DP with deque optimization', 'BFS-like forward jumps'],
    concept: 'Combine prefix sums with a monotonic deque to efficiently find shortest subarrays. For jump game with score, use DP optimized with a max-deque on the window of reachable positions.',
  },
  {
    day: 14, week: 2, topic: 'Queue', weekName: 'Week 2 — Queue & Deque',
    objective: 'Apply BFS (queue-based) to grid traversal problems.',
    keyPatterns: ['Multi-source BFS', 'Grid distance propagation', 'Obstacle handling in BFS'],
    concept: 'BFS uses a queue to explore nodes level-by-level, guaranteeing shortest path in unweighted graphs. Multi-source BFS starts from all sources simultaneously.',
  },
  {
    day: 15, week: 3, topic: 'Linked List', weekName: 'Week 3 — Linked List',
    objective: 'Begin Linked List week with reversal and merging fundamentals.',
    keyPatterns: ['Three-pointer reversal', 'Merge with dummy head', 'Iterative vs recursive'],
    concept: 'To reverse a linked list, maintain prev, curr, and next pointers. For merging sorted lists, use a dummy head to simplify edge cases and build the result by comparing.',
  },
  {
    day: 16, week: 3, topic: 'Linked List', weekName: 'Week 3 — Linked List',
    objective: 'Find the middle of a list and detect cycles using slow/fast pointers.',
    keyPatterns: ['Slow-fast pointer pattern', 'Floyd\'s cycle detection', 'Mid-point splitting'],
    concept: 'Two-pointer technique: fast pointer moves 2x speed of slow. When fast reaches end, slow is at middle. If there\'s a cycle, fast and slow will eventually meet.',
  },
  {
    day: 17, week: 3, topic: 'Linked List', weekName: 'Week 3 — Linked List',
    objective: 'Remove duplicate nodes and elements by value from linked lists.',
    keyPatterns: ['Prev pointer technique', 'Dummy head simplification', 'In-place node removal'],
    concept: 'For removal problems, maintain a prev pointer. When you find a node to remove, set prev.next = curr.next and skip the node. A dummy head handles the case when the head itself is removed.',
  },
  {
    day: 18, week: 3, topic: 'Linked List', weekName: 'Week 3 — Linked List',
    objective: 'Remove nodes by position and find cycle entry points.',
    keyPatterns: ['Two-pointer gap technique for k-th from end', 'Floyd\'s cycle detection + entry point', 'Phase 1 and Phase 2 of cycle detection'],
    concept: 'For n-th from end: move fast pointer n steps ahead, then move both until fast reaches end. For cycle entry, after detection meeting point, reset one pointer to head — they meet at the cycle entry.',
  },
  {
    day: 19, week: 3, topic: 'Linked List', weekName: 'Week 3 — Linked List',
    objective: 'Add numbers represented as linked lists and swap adjacent nodes.',
    keyPatterns: ['Carry propagation in linked lists', 'Dummy head for result construction', 'Pair swapping without value copy'],
    concept: 'Add corresponding digits with a carry, creating new nodes. For swapping pairs, rewire 3 pointers (prev, first, second) without touching node values.',
  },
  {
    day: 20, week: 3, topic: 'Linked List', weekName: 'Week 3 — Linked List',
    objective: 'Reorder and reverse sublists with in-place pointer manipulation.',
    keyPatterns: ['Find middle → reverse second half → merge', 'Left-right pointer approach', 'In-place reversal between positions'],
    concept: 'Reorder list: split at middle, reverse second half, then interleave. For reverse between positions, count to left boundary, then reverse the sublist, reconnect.',
  },
  {
    day: 21, week: 3, topic: 'Linked List', weekName: 'Week 3 — Linked List',
    objective: 'Handle complex pointer structures and merge k sorted lists.',
    keyPatterns: ['HashMap for random pointer cloning', 'Priority queue for k-way merge', 'Interleaving for O(1) space clone'],
    concept: 'Deep copy with random pointers: either use a hash map (old→new), or interleave nodes. For k-way merge, use a min-heap of (value, node) tuples to always pick the smallest head.',
  },
  {
    day: 22, week: 4, topic: 'Binary Tree', weekName: 'Week 4 — Binary Tree',
    objective: 'Begin Binary Tree week with iterative preorder and inorder traversals.',
    keyPatterns: ['Stack-based DFS traversal', 'Iterative inorder pattern', 'Node visit ordering'],
    concept: 'Preorder (root→left→right): push right then left to stack. Inorder (left→root→right): go all the way left, then process, then go right. Both use explicit stacks to avoid recursion.',
  },
  {
    day: 23, week: 4, topic: 'Binary Tree', weekName: 'Week 4 — Binary Tree',
    objective: 'Implement postorder traversal and level-order (BFS) traversal.',
    keyPatterns: ['Postorder with two stacks or reverse trick', 'Queue-based level traversal', 'Level boundary tracking'],
    concept: 'Postorder (left→right→root): traverse root→right→left and reverse, or use two stacks. Level-order uses a queue; process all nodes at current level before advancing.',
  },
  {
    day: 24, week: 4, topic: 'Binary Tree', weekName: 'Week 4 — Binary Tree',
    objective: 'Calculate maximum depth and check if two trees are identical.',
    keyPatterns: ['Recursive DFS depth', 'Null base case handling', 'Simultaneous tree traversal'],
    concept: 'Max depth = 1 + max(depth(left), depth(right)). For same tree check, recursively compare root values and both subtrees simultaneously, returning false on any mismatch.',
  },
  {
    day: 25, week: 4, topic: 'Binary Tree', weekName: 'Week 4 — Binary Tree',
    objective: 'Invert a binary tree and verify symmetry.',
    keyPatterns: ['Recursive swap of children', 'Mirror comparison pattern', 'Queue-based symmetry check'],
    concept: 'Invert: swap left and right children at every node recursively. Symmetric: compare tree with its own mirror — check outer pair and inner pair simultaneously using recursion or a queue.',
  },
  {
    day: 26, week: 4, topic: 'Binary Tree', weekName: 'Week 4 — Binary Tree',
    objective: 'Check balance and compute the diameter of a binary tree.',
    keyPatterns: ['Height-balanced definition', 'Post-order height calculation', 'Diameter as longest path through any node'],
    concept: 'A tree is balanced if |height(left) − height(right)| ≤ 1 for every node. Diameter at a node = height(left) + height(right). Track the global max diameter during the height DFS.',
  },
  {
    day: 27, week: 4, topic: 'Binary Tree', weekName: 'Week 4 — Binary Tree',
    objective: 'Find lowest common ancestor and get the right side view.',
    keyPatterns: ['LCA recursive search', 'Left and right subtree split', 'BFS rightmost per level'],
    concept: 'LCA: if both p and q are in different subtrees of a node, that node is the LCA. Right side view: do BFS and collect the last node at each level, or do right-first DFS tracking depth.',
  },
  {
    day: 28, week: 4, topic: 'Binary Tree', weekName: 'Week 4 — Binary Tree',
    objective: 'Validate BST properties and find k-th smallest element.',
    keyPatterns: ['In-order traversal gives sorted BST values', 'Min/max bounds validation', 'Counting with in-order iteration'],
    concept: 'BST in-order traversal produces sorted output. Validate by passing min/max bounds recursively. For k-th smallest, do in-order traversal and count — the k-th node visited is the answer.',
  },
  {
    day: 29, week: 5, topic: 'Mixed', weekName: 'Days 29–30 — Mixed Revision',
    objective: 'Combine heap and linked list techniques for stream processing.',
    keyPatterns: ['Two-heap median maintenance', 'Merge sort on linked list', 'Divide and conquer on lists'],
    concept: 'Find Median from Stream: maintain a max-heap for lower half and min-heap for upper half, keeping sizes balanced. For Sort List, use merge sort — split by middle, sort halves recursively, merge.',
  },
  {
    day: 30, week: 5, topic: 'Mixed', weekName: 'Days 29–30 — Mixed Revision',
    objective: 'Final day — flatten tree to list and implement BST iterator.',
    keyPatterns: ['Morris traversal / stack-based flatten', 'Controlled in-order with stack', 'Lazy iterator pattern'],
    concept: 'Flatten Binary Tree: use pre-order traversal, rewire right pointers, set left = null. BST Iterator: simulate in-order with an explicit stack, pushing left subtree on initialization and navigating right on next().',
  },
];

export const PROBLEMS: Problem[] = [
  // Day 1 — Stack
  { id: 'd1p1', number: 20, title: 'Valid Parentheses', difficulty: 'Easy', topic: 'Stack', day: 1, week: 1, url: 'https://leetcode.com/problems/valid-parentheses/', orderInDay: 1 },
  { id: 'd1p2', title: 'Remove All Adjacent Duplicates in String', difficulty: 'Easy', topic: 'Stack', day: 1, week: 1, url: 'https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string/', orderInDay: 2 },
  // Day 2
  { id: 'd2p1', number: 155, title: 'Min Stack', difficulty: 'Medium', topic: 'Stack', day: 2, week: 1, url: 'https://leetcode.com/problems/min-stack/', orderInDay: 1 },
  { id: 'd2p2', title: 'Implement Queue using Stacks', difficulty: 'Easy', topic: 'Stack', day: 2, week: 1, url: 'https://leetcode.com/problems/implement-queue-using-stacks/', orderInDay: 2 },
  // Day 3
  { id: 'd3p1', number: 150, title: 'Evaluate Reverse Polish Notation', difficulty: 'Medium', topic: 'Stack', day: 3, week: 1, url: 'https://leetcode.com/problems/evaluate-reverse-polish-notation/', orderInDay: 1 },
  { id: 'd3p2', title: 'Simplify Path', difficulty: 'Medium', topic: 'Stack', day: 3, week: 1, url: 'https://leetcode.com/problems/simplify-path/', orderInDay: 2 },
  // Day 4
  { id: 'd4p1', number: 739, title: 'Daily Temperatures', difficulty: 'Medium', topic: 'Stack', day: 4, week: 1, url: 'https://leetcode.com/problems/daily-temperatures/', orderInDay: 1 },
  { id: 'd4p2', title: 'Next Greater Element I', difficulty: 'Easy', topic: 'Stack', day: 4, week: 1, url: 'https://leetcode.com/problems/next-greater-element-i/', orderInDay: 2 },
  // Day 5
  { id: 'd5p1', number: 901, title: 'Online Stock Span', difficulty: 'Medium', topic: 'Stack', day: 5, week: 1, url: 'https://leetcode.com/problems/online-stock-span/', orderInDay: 1 },
  { id: 'd5p2', title: 'Next Greater Element II', difficulty: 'Medium', topic: 'Stack', day: 5, week: 1, url: 'https://leetcode.com/problems/next-greater-element-ii/', orderInDay: 2 },
  // Day 6
  { id: 'd6p1', number: 84, title: 'Largest Rectangle in Histogram', difficulty: 'Hard', topic: 'Stack', day: 6, week: 1, url: 'https://leetcode.com/problems/largest-rectangle-in-histogram/', orderInDay: 1 },
  { id: 'd6p2', title: 'Remove K Digits', difficulty: 'Medium', topic: 'Stack', day: 6, week: 1, url: 'https://leetcode.com/problems/remove-k-digits/', orderInDay: 2 },
  // Day 7
  { id: 'd7p1', number: 735, title: 'Asteroid Collision', difficulty: 'Medium', topic: 'Stack', day: 7, week: 1, url: 'https://leetcode.com/problems/asteroid-collision/', orderInDay: 1 },
  { id: 'd7p2', title: 'Decode String', difficulty: 'Medium', topic: 'Stack', day: 7, week: 1, url: 'https://leetcode.com/problems/decode-string/', orderInDay: 2 },
  // Day 8 — Queue
  { id: 'd8p1', number: 933, title: 'Number of Recent Calls', difficulty: 'Easy', topic: 'Queue', day: 8, week: 2, url: 'https://leetcode.com/problems/number-of-recent-calls/', orderInDay: 1 },
  { id: 'd8p2', title: 'Moving Average from Data Stream', difficulty: 'Easy', topic: 'Queue', day: 8, week: 2, url: 'https://leetcode.com/problems/moving-average-from-data-stream/', orderInDay: 2 },
  // Day 9
  { id: 'd9p1', number: 622, title: 'Design Circular Queue', difficulty: 'Medium', topic: 'Deque', day: 9, week: 2, url: 'https://leetcode.com/problems/design-circular-queue/', orderInDay: 1 },
  { id: 'd9p2', title: 'Design Circular Deque', difficulty: 'Medium', topic: 'Deque', day: 9, week: 2, url: 'https://leetcode.com/problems/design-circular-deque/', orderInDay: 2 },
  // Day 10
  { id: 'd10p1', number: 225, title: 'Implement Stack using Queues', difficulty: 'Easy', topic: 'Queue', day: 10, week: 2, url: 'https://leetcode.com/problems/implement-stack-using-queues/', orderInDay: 1 },
  { id: 'd10p2', title: 'Number of Students Unable to Eat Lunch', difficulty: 'Easy', topic: 'Queue', day: 10, week: 2, url: 'https://leetcode.com/problems/number-of-students-unable-to-eat-lunch/', orderInDay: 2 },
  // Day 11
  { id: 'd11p1', number: 649, title: 'Dota2 Senate', difficulty: 'Medium', topic: 'Queue', day: 11, week: 2, url: 'https://leetcode.com/problems/dota2-senate/', orderInDay: 1 },
  { id: 'd11p2', title: 'Reveal Cards In Increasing Order', difficulty: 'Medium', topic: 'Queue', day: 11, week: 2, url: 'https://leetcode.com/problems/reveal-cards-in-increasing-order/', orderInDay: 2 },
  // Day 12
  { id: 'd12p1', number: 239, title: 'Sliding Window Maximum', difficulty: 'Hard', topic: 'Deque', day: 12, week: 2, url: 'https://leetcode.com/problems/sliding-window-maximum/', orderInDay: 1 },
  { id: 'd12p2', title: 'Longest Continuous Subarray With Absolute Diff Less Than or Equal to Limit', difficulty: 'Medium', topic: 'Deque', day: 12, week: 2, url: 'https://leetcode.com/problems/longest-continuous-subarray-with-absolute-diff-less-than-or-equal-to-limit/', orderInDay: 2 },
  // Day 13
  { id: 'd13p1', number: 862, title: 'Shortest Subarray with Sum at Least K', difficulty: 'Hard', topic: 'Deque', day: 13, week: 2, url: 'https://leetcode.com/problems/shortest-subarray-with-sum-at-least-k/', orderInDay: 1 },
  { id: 'd13p2', title: 'Jump Game VI', difficulty: 'Medium', topic: 'Deque', day: 13, week: 2, url: 'https://leetcode.com/problems/jump-game-vi/', orderInDay: 2 },
  // Day 14
  { id: 'd14p1', number: 994, title: 'Rotting Oranges', difficulty: 'Medium', topic: 'Queue', day: 14, week: 2, url: 'https://leetcode.com/problems/rotting-oranges/', orderInDay: 1 },
  { id: 'd14p2', title: 'Shortest Path in Binary Matrix', difficulty: 'Medium', topic: 'Queue', day: 14, week: 2, url: 'https://leetcode.com/problems/shortest-path-in-binary-matrix/', orderInDay: 2 },
  // Day 15 — Linked List
  { id: 'd15p1', number: 206, title: 'Reverse Linked List', difficulty: 'Easy', topic: 'Linked List', day: 15, week: 3, url: 'https://leetcode.com/problems/reverse-linked-list/', orderInDay: 1 },
  { id: 'd15p2', title: 'Merge Two Sorted Lists', difficulty: 'Easy', topic: 'Linked List', day: 15, week: 3, url: 'https://leetcode.com/problems/merge-two-sorted-lists/', orderInDay: 2 },
  // Day 16
  { id: 'd16p1', number: 876, title: 'Middle of the Linked List', difficulty: 'Easy', topic: 'Linked List', day: 16, week: 3, url: 'https://leetcode.com/problems/middle-of-the-linked-list/', orderInDay: 1 },
  { id: 'd16p2', title: 'Linked List Cycle', difficulty: 'Easy', topic: 'Linked List', day: 16, week: 3, url: 'https://leetcode.com/problems/linked-list-cycle/', orderInDay: 2 },
  // Day 17
  { id: 'd17p1', number: 83, title: 'Remove Duplicates from Sorted List', difficulty: 'Easy', topic: 'Linked List', day: 17, week: 3, url: 'https://leetcode.com/problems/remove-duplicates-from-sorted-list/', orderInDay: 1 },
  { id: 'd17p2', title: 'Remove Linked List Elements', difficulty: 'Easy', topic: 'Linked List', day: 17, week: 3, url: 'https://leetcode.com/problems/remove-linked-list-elements/', orderInDay: 2 },
  // Day 18
  { id: 'd18p1', number: 19, title: 'Remove Nth Node From End of List', difficulty: 'Medium', topic: 'Linked List', day: 18, week: 3, url: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/', orderInDay: 1 },
  { id: 'd18p2', title: 'Linked List Cycle II', difficulty: 'Medium', topic: 'Linked List', day: 18, week: 3, url: 'https://leetcode.com/problems/linked-list-cycle-ii/', orderInDay: 2 },
  // Day 19
  { id: 'd19p1', number: 2, title: 'Add Two Numbers', difficulty: 'Medium', topic: 'Linked List', day: 19, week: 3, url: 'https://leetcode.com/problems/add-two-numbers/', orderInDay: 1 },
  { id: 'd19p2', title: 'Swap Nodes in Pairs', difficulty: 'Medium', topic: 'Linked List', day: 19, week: 3, url: 'https://leetcode.com/problems/swap-nodes-in-pairs/', orderInDay: 2 },
  // Day 20
  { id: 'd20p1', number: 143, title: 'Reorder List', difficulty: 'Medium', topic: 'Linked List', day: 20, week: 3, url: 'https://leetcode.com/problems/reorder-list/', orderInDay: 1 },
  { id: 'd20p2', title: 'Reverse Linked List II', difficulty: 'Medium', topic: 'Linked List', day: 20, week: 3, url: 'https://leetcode.com/problems/reverse-linked-list-ii/', orderInDay: 2 },
  // Day 21
  { id: 'd21p1', number: 138, title: 'Copy List with Random Pointer', difficulty: 'Medium', topic: 'Linked List', day: 21, week: 3, url: 'https://leetcode.com/problems/copy-list-with-random-pointer/', orderInDay: 1 },
  { id: 'd21p2', title: 'Merge k Sorted Lists', difficulty: 'Hard', topic: 'Linked List', day: 21, week: 3, url: 'https://leetcode.com/problems/merge-k-sorted-lists/', orderInDay: 2 },
  // Day 22 — Binary Tree
  { id: 'd22p1', number: 144, title: 'Binary Tree Preorder Traversal', difficulty: 'Easy', topic: 'Binary Tree', day: 22, week: 4, url: 'https://leetcode.com/problems/binary-tree-preorder-traversal/', orderInDay: 1 },
  { id: 'd22p2', title: 'Binary Tree Inorder Traversal', difficulty: 'Easy', topic: 'Binary Tree', day: 22, week: 4, url: 'https://leetcode.com/problems/binary-tree-inorder-traversal/', orderInDay: 2 },
  // Day 23
  { id: 'd23p1', number: 145, title: 'Binary Tree Postorder Traversal', difficulty: 'Easy', topic: 'Binary Tree', day: 23, week: 4, url: 'https://leetcode.com/problems/binary-tree-postorder-traversal/', orderInDay: 1 },
  { id: 'd23p2', title: 'Binary Tree Level Order Traversal', difficulty: 'Medium', topic: 'Binary Tree', day: 23, week: 4, url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/', orderInDay: 2 },
  // Day 24
  { id: 'd24p1', number: 104, title: 'Maximum Depth of Binary Tree', difficulty: 'Easy', topic: 'Binary Tree', day: 24, week: 4, url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', orderInDay: 1 },
  { id: 'd24p2', title: 'Same Tree', difficulty: 'Easy', topic: 'Binary Tree', day: 24, week: 4, url: 'https://leetcode.com/problems/same-tree/', orderInDay: 2 },
  // Day 25
  { id: 'd25p1', number: 226, title: 'Invert Binary Tree', difficulty: 'Easy', topic: 'Binary Tree', day: 25, week: 4, url: 'https://leetcode.com/problems/invert-binary-tree/', orderInDay: 1 },
  { id: 'd25p2', title: 'Symmetric Tree', difficulty: 'Easy', topic: 'Binary Tree', day: 25, week: 4, url: 'https://leetcode.com/problems/symmetric-tree/', orderInDay: 2 },
  // Day 26
  { id: 'd26p1', number: 110, title: 'Balanced Binary Tree', difficulty: 'Easy', topic: 'Binary Tree', day: 26, week: 4, url: 'https://leetcode.com/problems/balanced-binary-tree/', orderInDay: 1 },
  { id: 'd26p2', title: 'Diameter of Binary Tree', difficulty: 'Easy', topic: 'Binary Tree', day: 26, week: 4, url: 'https://leetcode.com/problems/diameter-of-binary-tree/', orderInDay: 2 },
  // Day 27
  { id: 'd27p1', number: 236, title: 'Lowest Common Ancestor of a Binary Tree', difficulty: 'Medium', topic: 'Binary Tree', day: 27, week: 4, url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/', orderInDay: 1 },
  { id: 'd27p2', title: 'Binary Tree Right Side View', difficulty: 'Medium', topic: 'Binary Tree', day: 27, week: 4, url: 'https://leetcode.com/problems/binary-tree-right-side-view/', orderInDay: 2 },
  // Day 28
  { id: 'd28p1', number: 98, title: 'Validate Binary Search Tree', difficulty: 'Medium', topic: 'Binary Tree', day: 28, week: 4, url: 'https://leetcode.com/problems/validate-binary-search-tree/', orderInDay: 1 },
  { id: 'd28p2', title: 'Kth Smallest Element in a BST', difficulty: 'Medium', topic: 'Binary Tree', day: 28, week: 4, url: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/', orderInDay: 2 },
  // Day 29 — Mixed
  { id: 'd29p1', number: 295, title: 'Find Median from Data Stream', difficulty: 'Hard', topic: 'Mixed', day: 29, week: 5, url: 'https://leetcode.com/problems/find-median-from-data-stream/', orderInDay: 1 },
  { id: 'd29p2', title: 'Sort List', difficulty: 'Medium', topic: 'Mixed', day: 29, week: 5, url: 'https://leetcode.com/problems/sort-list/', orderInDay: 2 },
  // Day 30
  { id: 'd30p1', number: 114, title: 'Flatten Binary Tree to Linked List', difficulty: 'Medium', topic: 'Mixed', day: 30, week: 5, url: 'https://leetcode.com/problems/flatten-binary-tree-to-linked-list/', orderInDay: 1 },
  { id: 'd30p2', title: 'Binary Search Tree Iterator', difficulty: 'Medium', topic: 'Mixed', day: 30, week: 5, url: 'https://leetcode.com/problems/binary-search-tree-iterator/', orderInDay: 2 },
];
