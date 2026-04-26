import sys

def check_balance(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    
    lines = content.split('\n')
    for line_no, line in enumerate(lines, 1):
        for char in line:
            if char in '({[':
                stack.append((char, line_no, line))
            elif char in ')}]':
                if not stack:
                    print(f"Extra closing {char} at line {line_no}: {line}")
                    continue
                top_char, top_line_no, top_line = stack.pop()
                if top_char != mapping[char]:
                    print(f"Mismatched: {top_char} (L{top_line_no}) and {char} (L{line_no})")
    
    for char, line_no, line in stack:
        print(f"Unclosed {char} at line {line_no}: {line}")

if __name__ == "__main__":
    check_balance(sys.argv[1])
