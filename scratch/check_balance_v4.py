import sys

def check_balance(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    
    in_string = None
    escaped = False
    
    lines = content.split('\n')
    for line_no, line in enumerate(lines, 1):
        for i, char in enumerate(line):
            if escaped:
                escaped = False
                continue
            if char == '\\':
                escaped = True
                continue
            
            if in_string:
                if char == in_string:
                    in_string = None
                continue
            
            if char in "\"'`":
                in_string = char
                continue
            
            # Note: This doesn't handle multi-line comments or template literals correctly 
            # but template literals are rarely unclosed in this codebase.
            
            if char in '({[':
                stack.append((char, line_no, line.strip()))
            elif char in ')}]':
                if not stack:
                    print(f"Extra closing {char} at line {line_no}: {line.strip()}")
                    continue
                top_char, top_line_no, top_line = stack.pop()
                if top_char != mapping[char]:
                    print(f"Mismatched: {top_char} (L{top_line_no}: {top_line}) and {char} (L{line_no}: {line.strip()})")
    
    for char, line_no, line in stack:
        print(f"Unclosed {char} at line {line_no}: {line}")

if __name__ == "__main__":
    check_balance(sys.argv[1])
