import sys

def check_balance(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    stack = []
    mapping = {')': '(', '}': '{', ']': '['}
    
    for i, char in enumerate(content):
        if char in '({[':
            stack.append((char, i))
        elif char in ')}]':
            if not stack:
                print(f"Extra closing character {char} at position {i}")
                return
            top_char, top_pos = stack.pop()
            if top_char != mapping[char]:
                print(f"Mismatched characters: {top_char} at {top_pos} and {char} at {i}")
                return
    
    if stack:
        for char, pos in stack:
            # Find line number
            line_no = content.count('\n', 0, pos) + 1
            print(f"Unclosed character {char} at line {line_no}")
    else:
        print("All characters balanced!")

if __name__ == "__main__":
    check_balance(sys.argv[1])
