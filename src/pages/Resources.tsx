import { useState } from 'react';
import { Code2, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

function CodeBlock({ code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block" style={{ position: 'relative' }}>
      <button
        onClick={handleCopy}
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 6,
          padding: '4px 8px',
          cursor: 'pointer',
          color: copied ? 'var(--success)' : 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 12,
        }}
        aria-label="Copy code"
      >
        {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
      </button>
      <pre style={{ margin: 0, fontFamily: 'JetBrains Mono, monospace', fontSize: 13, lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
        {code}
      </pre>
    </div>
  );
}

interface SectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  color?: string;
}

function Section({ title, icon, children, color = 'var(--accent-blue)' }: SectionProps) {
  const [open, setOpen] = useState(true);
  return (
    <div className="resource-section">
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          width: '100%',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          marginBottom: open ? 20 : 0,
        }}
      >
        <span style={{ fontSize: 22 }}>{icon}</span>
        <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>{title}</span>
        <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

interface ConceptListProps {
  items: string[];
  color?: string;
}

function ConceptList({ items }: ConceptListProps) {
  return (
    <ul style={{ margin: '0 0 16px 0', padding: 0, listStyle: 'none' }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, fontSize: 14, color: 'var(--text-secondary)' }}>
          <span style={{ color: 'var(--accent-blue)', fontWeight: 700, flexShrink: 0 }}>▸</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

interface OpTableProps {
  ops: { op: string; description: string; complexity: string }[];
}

function OpTable({ ops }: OpTableProps) {
  return (
    <div style={{ overflowX: 'auto', marginBottom: 16 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {['Operation', 'Description', 'Time Complexity'].map(h => (
              <th key={h} style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ops.map((op, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
              <td style={{ padding: '8px 12px', fontFamily: 'JetBrains Mono', color: 'var(--accent-blue-light)' }}>{op.op}</td>
              <td style={{ padding: '8px 12px', color: 'var(--text-secondary)' }}>{op.description}</td>
              <td style={{ padding: '8px 12px', fontFamily: 'JetBrains Mono', color: '#fbbf24' }}>{op.complexity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Resources() {
  return (
    <div className="page-container">
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Code2 size={22} style={{ color: 'var(--accent-blue)' }} />
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)' }}>
            C++ Resources
          </h1>
        </div>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          Quick reference for data structures covered in this challenge.
        </p>
      </div>

      {/* Stack */}
      <Section title="Stack" icon="📚">
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Core Concepts</h3>
        <ConceptList items={[
          'LIFO — Last In, First Out',
          'Elements are pushed onto and popped from the top',
          'Perfect for matching/pairing problems (brackets, parentheses)',
          'Monotonic stack pattern for next greater/smaller element',
          'Expression evaluation (RPN, infix to postfix)',
          'Undo-redo operations and browser history',
        ]} />

        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Operations</h3>
        <OpTable ops={[
          { op: 'st.push(x)', description: 'Push element x onto the stack', complexity: 'O(1)' },
          { op: 'st.pop()', description: 'Remove the top element (no return value)', complexity: 'O(1)' },
          { op: 'st.top()', description: 'Access the top element without removing', complexity: 'O(1)' },
          { op: 'st.empty()', description: 'Check if stack is empty', complexity: 'O(1)' },
          { op: 'st.size()', description: 'Return number of elements', complexity: 'O(1)' },
        ]} />

        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>C++ Example</h3>
        <CodeBlock code={`#include <stack>
#include <iostream>
using namespace std;

int main() {
    stack<int> st;
    
    st.push(10);   // Stack: [10]
    st.push(20);   // Stack: [10, 20]
    st.push(30);   // Stack: [10, 20, 30]
    
    cout << st.top();  // Output: 30 (top element)
    st.pop();          // Remove 30. Stack: [10, 20]
    cout << st.top();  // Output: 20
    cout << st.size(); // Output: 2
    cout << st.empty(); // Output: 0 (false)
    
    return 0;
}

// Monotonic stack — Next Greater Element pattern:
vector<int> nextGreater(vector<int>& nums) {
    int n = nums.size();
    vector<int> result(n, -1);
    stack<int> st; // stores indices
    
    for (int i = 0; i < n; i++) {
        while (!st.empty() && nums[st.top()] < nums[i]) {
            result[st.top()] = nums[i];
            st.pop();
        }
        st.push(i);
    }
    return result;
}`} />
      </Section>

      {/* Queue */}
      <Section title="Queue & Deque" icon="🚃">
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Core Concepts</h3>
        <ConceptList items={[
          'Queue: FIFO — First In, First Out',
          'Deque (double-ended queue): push/pop from both ends',
          'Circular queue: space-efficient fixed-size queue',
          'BFS (Breadth-First Search) uses a queue for level-order traversal',
          'Sliding window maximum uses a monotonic deque',
          'Priority queue (heap) for ordering elements by priority',
        ]} />

        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Queue Operations</h3>
        <OpTable ops={[
          { op: 'q.push(x)', description: 'Enqueue element at the back', complexity: 'O(1)' },
          { op: 'q.pop()', description: 'Dequeue element from the front', complexity: 'O(1)' },
          { op: 'q.front()', description: 'Access the front element', complexity: 'O(1)' },
          { op: 'q.back()', description: 'Access the back element', complexity: 'O(1)' },
          { op: 'q.empty()', description: 'Check if queue is empty', complexity: 'O(1)' },
        ]} />

        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Queue C++ Example</h3>
        <CodeBlock code={`#include <queue>
#include <iostream>
using namespace std;

int main() {
    queue<int> q;
    
    q.push(10);   // Queue: [10]
    q.push(20);   // Queue: [10, 20]
    q.push(30);   // Queue: [10, 20, 30]
    
    cout << q.front(); // Output: 10 (front element)
    q.pop();           // Remove 10. Queue: [20, 30]
    cout << q.front(); // Output: 20
    cout << q.back();  // Output: 30
    
    return 0;
}

// BFS pattern using queue:
void bfs(vector<vector<int>>& grid, int startR, int startC) {
    queue<pair<int,int>> q;
    q.push({startR, startC});
    
    int dirs[4][2] = {{0,1},{0,-1},{1,0},{-1,0}};
    while (!q.empty()) {
        auto [r, c] = q.front(); q.pop();
        for (auto& d : dirs) {
            int nr = r + d[0], nc = c + d[1];
            if (/* valid cell */) q.push({nr, nc});
        }
    }
}`} />

        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, marginTop: 16 }}>Deque Operations</h3>
        <OpTable ops={[
          { op: 'dq.push_back(x)', description: 'Add element to the back', complexity: 'O(1)' },
          { op: 'dq.push_front(x)', description: 'Add element to the front', complexity: 'O(1)' },
          { op: 'dq.pop_back()', description: 'Remove element from the back', complexity: 'O(1)' },
          { op: 'dq.pop_front()', description: 'Remove element from the front', complexity: 'O(1)' },
          { op: 'dq.front()', description: 'Access the front element', complexity: 'O(1)' },
          { op: 'dq.back()', description: 'Access the back element', complexity: 'O(1)' },
        ]} />

        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Deque C++ Example</h3>
        <CodeBlock code={`#include <deque>
#include <iostream>
using namespace std;

int main() {
    deque<int> dq;
    
    dq.push_back(10);   // dq: [10]
    dq.push_front(5);   // dq: [5, 10]
    dq.push_back(20);   // dq: [5, 10, 20]
    
    cout << dq.front(); // Output: 5
    dq.pop_front();     // dq: [10, 20]
    dq.pop_back();      // dq: [10]
    cout << dq.back();  // Output: 10
    
    return 0;
}

// Sliding Window Maximum with monotonic deque:
vector<int> maxSlidingWindow(vector<int>& nums, int k) {
    deque<int> dq; // stores indices, decreasing values
    vector<int> result;
    
    for (int i = 0; i < nums.size(); i++) {
        // Remove out-of-window indices from front
        while (!dq.empty() && dq.front() < i - k + 1) dq.pop_front();
        // Remove smaller elements from back (maintain decreasing order)
        while (!dq.empty() && nums[dq.back()] < nums[i]) dq.pop_back();
        dq.push_back(i);
        if (i >= k - 1) result.push_back(nums[dq.front()]);
    }
    return result;
}`} />
      </Section>

      {/* Linked List */}
      <Section title="Linked List" icon="🔗">
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Core Concepts</h3>
        <ConceptList items={[
          'ListNode: value + pointer to next node',
          'Singly linked — traverse forward only',
          'Doubly linked — traverse forward and backward',
          'Slow & fast pointer pattern for cycle detection and midpoint',
          'Dummy head node to simplify insertion/deletion at head',
          'Reversal: three pointers — prev, curr, next',
          'Merge sort is natural fit for linked list sorting',
        ]} />

        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>ListNode Structure & Basic Operations</h3>
        <CodeBlock code={`struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

// Reverse a linked list (iterative) — O(n)
ListNode* reverse(ListNode* head) {
    ListNode* prev = nullptr;
    ListNode* curr = head;
    while (curr) {
        ListNode* next = curr->next;  // Save next
        curr->next = prev;            // Reverse pointer
        prev = curr;                  // Move prev forward
        curr = next;                  // Move curr forward
    }
    return prev;  // New head
}

// Find middle using slow/fast pointers — O(n)
ListNode* findMiddle(ListNode* head) {
    ListNode* slow = head;
    ListNode* fast = head;
    while (fast->next && fast->next->next) {
        slow = slow->next;
        fast = fast->next->next;
    }
    return slow;  // slow is at the middle
}

// Detect cycle — Floyd's Algorithm — O(n)
bool hasCycle(ListNode* head) {
    ListNode* slow = head;
    ListNode* fast = head;
    while (fast && fast->next) {
        slow = slow->next;
        fast = fast->next->next;
        if (slow == fast) return true;  // Cycle detected
    }
    return false;
}

// Dummy head pattern for deletion — O(n)
ListNode* removeVal(ListNode* head, int val) {
    ListNode* dummy = new ListNode(0, head);  // Dummy before head
    ListNode* prev = dummy;
    ListNode* curr = head;
    while (curr) {
        if (curr->val == val) prev->next = curr->next;  // Skip
        else prev = curr;
        curr = curr->next;
    }
    return dummy->next;
}`} />
      </Section>

      {/* Binary Tree */}
      <Section title="Binary Tree" icon="🌳">
        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Core Concepts</h3>
        <ConceptList items={[
          'TreeNode: value + left child + right child',
          'DFS: Preorder (root→left→right), Inorder (left→root→right), Postorder (left→right→root)',
          'BFS: Level-order traversal using a queue',
          'BST Property: left < root < right (all nodes)',
          'BST inorder traversal gives sorted sequence',
          'Recursion is natural for trees — base case: null node',
          'Height of tree = max depth = longest path from root to leaf',
        ]} />

        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>TreeNode & Traversals</h3>
        <CodeBlock code={`struct TreeNode {
    int val;
    TreeNode *left, *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
};

// Preorder: root → left → right — O(n)
void preorder(TreeNode* root, vector<int>& res) {
    if (!root) return;
    res.push_back(root->val);    // Visit root
    preorder(root->left, res);   // Traverse left
    preorder(root->right, res);  // Traverse right
}

// Inorder: left → root → right — O(n)
// For BST this gives SORTED output
void inorder(TreeNode* root, vector<int>& res) {
    if (!root) return;
    inorder(root->left, res);
    res.push_back(root->val);    // Visit root (between children)
    inorder(root->right, res);
}

// Postorder: left → right → root — O(n)
void postorder(TreeNode* root, vector<int>& res) {
    if (!root) return;
    postorder(root->left, res);
    postorder(root->right, res);
    res.push_back(root->val);    // Visit root last
}

// Level-order BFS — O(n)
vector<vector<int>> levelOrder(TreeNode* root) {
    vector<vector<int>> result;
    if (!root) return result;
    queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        int sz = q.size();  // Nodes at this level
        vector<int> level;
        for (int i = 0; i < sz; i++) {
            TreeNode* node = q.front(); q.pop();
            level.push_back(node->val);
            if (node->left) q.push(node->left);
            if (node->right) q.push(node->right);
        }
        result.push_back(level);
    }
    return result;
}

// Maximum depth — O(n)
int maxDepth(TreeNode* root) {
    if (!root) return 0;
    return 1 + max(maxDepth(root->left), maxDepth(root->right));
}

// BST validation with bounds — O(n)
bool isValidBST(TreeNode* root, long lo = LONG_MIN, long hi = LONG_MAX) {
    if (!root) return true;
    if (root->val <= lo || root->val >= hi) return false;
    return isValidBST(root->left, lo, root->val) &&
           isValidBST(root->right, root->val, hi);
}`} />
      </Section>

      {/* Common Patterns */}
      <Section title="Common DSA Patterns" icon="🧠">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {[
            {
              title: 'Two Pointers',
              desc: 'Use two indices to traverse a data structure, often from opposite ends or at different speeds (slow/fast).',
              use: 'Cycle detection, finding middle, removing duplicates, palindrome check',
            },
            {
              title: 'Sliding Window',
              desc: 'Maintain a window of elements, expanding or shrinking it to satisfy a constraint.',
              use: 'Maximum in window, longest subarray, subarray sum problems',
            },
            {
              title: 'Monotonic Stack/Deque',
              desc: 'Maintain stack/deque in monotonically increasing or decreasing order.',
              use: 'Next greater element, histogram area, sliding window max',
            },
            {
              title: 'BFS (Queue)',
              desc: 'Explore nodes level by level using a queue. Guarantees shortest path in unweighted graphs.',
              use: 'Shortest path, grid traversal, tree level-order, multi-source spread',
            },
            {
              title: 'DFS (Stack/Recursion)',
              desc: 'Explore as deep as possible before backtracking. Natural for tree/graph recursion.',
              use: 'Tree traversals, path finding, cycle detection, topological sort',
            },
            {
              title: 'Dummy Head Node',
              desc: 'Add a sentinel node before the head to simplify edge cases in linked list operations.',
              use: 'Deletion, merging, reordering — avoids special-casing the head',
            },
          ].map(pattern => (
            <div key={pattern.title} style={{
              padding: 16,
              borderRadius: 10,
              background: 'rgba(59,130,246,0.05)',
              border: '1px solid rgba(59,130,246,0.12)',
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
                {pattern.title}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.5 }}>
                {pattern.desc}
              </div>
              <div style={{ fontSize: 12, color: 'var(--accent-blue-light)' }}>
                <strong>Used for:</strong> {pattern.use}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
