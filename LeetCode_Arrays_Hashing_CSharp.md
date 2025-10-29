# LeetCode Arrays & Hashing (C# Fundamentals Deck 1)

This deck covers the first LeetCode DSA section using C# fundamentals.  
It includes syntax, data structures, and core algorithm patterns for arrays and hashing problems.

---

## Front
What’s the main difference between an array and a `List<T>` in C#?

## Back
```csharp
int[] nums = new int[5]; // fixed size
var list = new List<int>(); // dynamic
list.Add(5);
```

## Hint
Arrays have fixed length; Lists resize automatically.

---

## Front
How to iterate through a list in C#?

## Back
```csharp
foreach (int n in list) {
    Console.WriteLine(n);
}
```

## Hint
Use `foreach` for simple iteration.

---

## Front
What is a HashSet used for?

## Back
```csharp
var set = new HashSet<int>();
set.Add(3);
set.Contains(3); // true
```

## Hint
Used for O(1) lookups and ensuring uniqueness.

---

## Front
What’s the C# equivalent of a HashMap?

## Back
```csharp
var map = new Dictionary<string, int>();
map["apple"] = 3;
if (map.ContainsKey("apple"))
    Console.WriteLine(map["apple"]);
```

## Hint
`Dictionary<TKey, TValue>` stores key-value pairs.

---

## Front
What’s the prefix sum pattern?

## Back
```csharp
int[] prefix = new int[arr.Length + 1];
for (int i = 0; i < arr.Length; i++) {
    prefix[i + 1] = prefix[i] + arr[i];
}
```

## Hint
Use `prefix[j] - prefix[i]` for range sums.

---

## Front
Contains Duplicate — core idea?

## Back
```csharp
public bool ContainsDuplicate(int[] nums) {
    var seen = new HashSet<int>();
    foreach (int n in nums) {
        if (seen.Contains(n)) return true;
        seen.Add(n);
    }
    return false;
}
```

## Hint
HashSet detects repeats in O(n).

---

## Front
Valid Anagram — key pattern?

## Back
```csharp
public bool IsAnagram(string s, string t) {
    if (s.Length != t.Length) return false;
    var count = new Dictionary<char, int>();
    foreach (char c in s)
        count[c] = count.GetValueOrDefault(c, 0) + 1;
    foreach (char c in t) {
        if (!count.ContainsKey(c)) return false;
        count[c]--;
        if (count[c] == 0) count.Remove(c);
    }
    return count.Count == 0;
}
```

## Hint
Compare character frequencies using Dictionary.

---

## Front
Two Sum — how do you find the pair?

## Back
```csharp
public int[] TwoSum(int[] nums, int target) {
    var map = new Dictionary<int, int>();
    for (int i = 0; i < nums.Length; i++) {
        int complement = target - nums[i];
        if (map.ContainsKey(complement))
            return new int[] { map[complement], i };
        map[nums[i]] = i;
    }
    return Array.Empty<int>();
}
```

## Hint
Lookup complement = target − num using Dictionary.

---

## Front
Group Anagrams — what’s the trick?

## Back
```csharp
public IList<IList<string>> GroupAnagrams(string[] strs) {
    var map = new Dictionary<string, List<string>>();
    foreach (string s in strs) {
        var key = new string(s.OrderBy(c => c).ToArray());
        if (!map.ContainsKey(key))
            map[key] = new List<string>();
        map[key].Add(s);
    }
    return map.Values.ToList<IList<string>>();
}
```

## Hint
Use sorted string as hash key.

---

## Front
Top K Frequent Elements — main logic?

## Back
```csharp
public int[] TopKFrequent(int[] nums, int k) {
    var freq = nums.GroupBy(n => n)
                   .ToDictionary(g => g.Key, g => g.Count());
    return freq.OrderByDescending(p => p.Value)
               .Take(k)
               .Select(p => p.Key)
               .ToArray();
}
```

## Hint
Count frequencies, sort by value, take top k.

---

## Front
Encode and Decode Strings — concept?

## Back
```csharp
public string Encode(IList<string> strs) {
    var sb = new StringBuilder();
    foreach (var s in strs)
        sb.Append(s.Length).Append('#').Append(s);
    return sb.ToString();
}

public IList<string> Decode(string str) {
    var res = new List<string>();
    int i = 0;
    while (i < str.Length) {
        int j = str.IndexOf('#', i);
        int len = int.Parse(str.Substring(i, j - i));
        res.Add(str.Substring(j + 1, len));
        i = j + 1 + len;
    }
    return res;
}
```

## Hint
Use length prefixing to avoid delimiter issues.

---

## Front
Product of Array Except Self — algorithm?

## Back
```csharp
public int[] ProductExceptSelf(int[] nums) {
    int n = nums.Length;
    int[] res = new int[n];
    int prefix = 1;
    for (int i = 0; i < n; i++) {
        res[i] = prefix;
        prefix *= nums[i];
    }
    int suffix = 1;
    for (int i = n - 1; i >= 0; i--) {
        res[i] *= suffix;
        suffix *= nums[i];
    }
    return res;
}
```

## Hint
Prefix × suffix trick; no division.

---

## Front
Valid Sudoku — pattern?

## Back
```csharp
public bool IsValidSudoku(char[][] board) {
    var rows = new HashSet<char>[9];
    var cols = new HashSet<char>[9];
    var boxes = new HashSet<char>[9];
    for (int i = 0; i < 9; i++) {
        rows[i] = new HashSet<char>();
        cols[i] = new HashSet<char>();
        boxes[i] = new HashSet<char>();
    }
    for (int r = 0; r < 9; r++) {
        for (int c = 0; c < 9; c++) {
            char val = board[r][c];
            if (val == '.') continue;
            int box = (r / 3) * 3 + (c / 3);
            if (!rows[r].Add(val) || !cols[c].Add(val) || !boxes[box].Add(val))
                return false;
        }
    }
    return true;
}
```

## Hint
Use 3 hashsets: row, column, box validation.

---

## Front
Longest Consecutive Sequence — core idea?

## Back
```csharp
public int LongestConsecutive(int[] nums) {
    var set = new HashSet<int>(nums);
    int longest = 0;
    foreach (int num in set) {
        if (!set.Contains(num - 1)) {
            int length = 1;
            while (set.Contains(num + length)) length++;
            longest = Math.Max(longest, length);
        }
    }
    return longest;
}
```

## Hint
Only count sequences starting from a new chain head.
