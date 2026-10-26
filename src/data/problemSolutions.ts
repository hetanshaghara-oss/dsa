// Curated interview-grade C++ solutions for fast instant recall
export const PROBLEM_SOLUTIONS: Record<string, string> = {
  d1p1: `// Problem 20: Valid Parentheses
// Invariant: Matching open bracket must be top of stack
class Solution {
public:
    bool isValid(string s) {
        stack<char> st;
        for (char c : s) {
            if (c == '(') st.push(')');
            else if (c == '{') st.push('}');
            else if (c == '[') st.push(']');
            else {
                if (st.empty() || st.top() != c) return false;
                st.pop();
            }
        }
        return st.empty();
    }
};`,

  d1p2: `// Problem 1047: Remove All Adjacent Duplicates In String
// Invariant: Maintain simplified string in-place as a stack
class Solution {
public:
    string removeDuplicates(string s) {
        string res = "";
        for (char c : s) {
            if (!res.empty() && res.back() == c) {
                res.pop_back(); // adjacent duplicate cancels
            } else {
                res.push_back(c);
            }
        }
        return res;
    }
};`,

  d2p1: `// Problem 155: Min Stack
// Invariant: Auxiliary stack stores min value at each depth
class MinStack {
    stack<int> mainSt;
    stack<int> minSt;
public:
    MinStack() {}
    
    void push(int val) {
        mainSt.push(val);
        if (minSt.empty() || val <= minSt.top()) {
            minSt.push(val);
        }
    }
    
    void pop() {
        if (mainSt.top() == minSt.top()) {
            minSt.pop();
        }
        mainSt.pop();
    }
    
    int top() {
        return mainSt.top();
    }
    
    int getMin() {
        return minSt.top();
    }
};`,

  d2p2: `// Problem 232: Implement Queue using Stacks
// Invariant: Amortized O(1) transfer from inStack to outStack
class MyQueue {
    stack<int> inSt, outSt;
    void transfer() {
        if (outSt.empty()) {
            while (!inSt.empty()) {
                outSt.push(inSt.top());
                inSt.pop();
            }
        }
    }
public:
    MyQueue() {}
    void push(int x) { inSt.push(x); }
    int pop() {
        transfer();
        int val = outSt.top();
        outSt.pop();
        return val;
    }
    int peek() {
        transfer();
        return outSt.top();
    }
    bool empty() {
        return inSt.empty() && outSt.empty();
    }
};`,

  d3p1: `// Problem 150: Evaluate Reverse Polish Notation
// Invariant: Operands pushed to stack, operators consume top 2 operands
class Solution {
public:
    int evalRPN(vector<string>& tokens) {
        stack<int> st;
        for (const string& t : tokens) {
            if (t == "+" || t == "-" || t == "*" || t == "/") {
                int b = st.top(); st.pop();
                int a = st.top(); st.pop();
                if (t == "+") st.push(a + b);
                else if (t == "-") st.push(a - b);
                else if (t == "*") st.push(a * b);
                else st.push(a / b);
            } else {
                st.push(stoi(t));
            }
        }
        return st.top();
    }
};`,

  d3p2: `// Problem 71: Simplify Path
// Invariant: Split by '/', skip '.' and empty, pop on '..', push valid tokens
class Solution {
public:
    string simplifyPath(string path) {
        vector<string> dirs;
        stringstream ss(path);
        string token;
        while (getline(ss, token, '/')) {
            if (token == "" || token == ".") continue;
            if (token == "..") {
                if (!dirs.empty()) dirs.pop_back();
            } else {
                dirs.push_back(token);
            }
        }
        string res = "";
        for (const auto& d : dirs) res += "/" + d;
        return res.empty() ? "/" : res;
    }
};`,

  d4p1: `// Problem 496: Next Greater Element I
// Invariant: Monotonic decreasing stack maps each element to its next greater
class Solution {
public:
    vector<int> nextGreaterElement(vector<int>& nums1, vector<int>& nums2) {
        unordered_map<int, int> nextGreater;
        stack<int> st; // monotonic decreasing
        for (int num : nums2) {
            while (!st.empty() && st.top() < num) {
                nextGreater[st.top()] = num;
                st.pop();
            }
            st.push(num);
        }
        vector<int> ans;
        for (int num : nums1) {
            ans.push_back(nextGreater.count(num) ? nextGreater[num] : -1);
        }
        return ans;
    }
};`,

  d4p2: `// Problem 739: Daily Temperatures
// Invariant: Decreasing stack of unresolved day indices
class Solution {
public:
    vector<int> dailyTemperatures(vector<int>& temperatures) {
        int n = temperatures.size();
        vector<int> ans(n, 0);
        stack<int> st; // stores indices
        for (int i = 0; i < n; ++i) {
            while (!st.empty() && temperatures[i] > temperatures[st.top()]) {
                int prevDay = st.top();
                st.pop();
                ans[prevDay] = i - prevDay;
            }
            st.push(i);
        }
        return ans;
    }
};`,
};

export function getProblemSolution(problemId: string, title?: string): string {
  if (PROBLEM_SOLUTIONS[problemId]) {
    return PROBLEM_SOLUTIONS[problemId];
  }
  // Clean fallback solution template for questions
  return `// Interview Blueprint & Optimal Approach for: ${title || problemId}
// 1. Identify base constraints & edge cases.
// 2. Choose optimal data structure according to pattern.
// 3. Process invariants in a single pass to ensure optimal time & space.
class Solution {
public:
    // Optimal implementation structure
    void solve() {
        // Step 1: Initialize states / data structure
        // Step 2: Iterate and update invariant
        // Step 3: Return result
    }
};`;
}
