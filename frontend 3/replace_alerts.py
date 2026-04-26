import os
import re

directories = [
    r"c:\xampp1\htdocs\TokoXpress1\frontend\src"
]

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'alert(' in content:
        # Check if sweetalert is imported
        if 'import Swal' not in content:
            # add import after the first import or at top
            import_statement = "import Swal from 'sweetalert2';\n"
            if content.startswith('import'):
                # find end of first import line
                lines = content.split('\n')
                for i, line in enumerate(lines):
                    if line.startswith('import'):
                        # insert after the last import block if possible, or just top
                        pass
                content = import_statement + content
            else:
                content = import_statement + content
            
        # replace alert with Swal.fire
        content = re.sub(r'\balert\(', 'Swal.fire(', content)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

for root_dir in directories:
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith(('.jsx', '.js', '.tsx', '.ts')):
                process_file(os.path.join(root, file))
