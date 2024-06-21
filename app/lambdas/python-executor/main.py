import json
import numpy as np

def is_json_serializable(value):
    try:
        json.dumps(value)
        return True
    except (TypeError, OverflowError):
        return False

class PythonExecutionError(Exception):
    """
    Exception raised when Python code execution fails.

    Attributes:
        message -- explanation of the error
    """

    def __init__(self, message="Python code execution failed"):
        self.message = message
        super().__init__(self.message)

def execute_code(code):
    local_vars = {}
    try:
        exec(code, globals(), local_vars)
    except Exception as e:
        raise PythonExecutionError(e)
    return {k: v for k, v in local_vars.items() if is_json_serializable(v)}

def handler(event, context):
    code = event['code']

    print(f'Executing code: {json.dumps(code)}')

    serializable_vars = execute_code(code)
    return json.dumps(serializable_vars)


# Random but fun, get a file tree diagram of the src folder of this project to feed into chatbot context.
# import os
# def generate_file_tree(start_path):
#     tree = []
#     for root, dirs, files in os.walk(start_path):
#         level = root.replace(start_path, '').count(os.sep)
#         indent = '│   ' * (level - 1) + '├── ' if level > 0 else ''
#         tree.append(f'{indent}{os.path.basename(root)}/')
#         for file in files:
#             indent = '│   ' * level + '├── '
#             tree.append(f'{indent}{file}')
#     return '\n'.join(tree)

# # Usage
# current_dir = os.path.dirname(os.path.abspath(__file__))
# folder_path = os.path.join(current_dir, '..', '..', 'src')
# file_tree = generate_file_tree(folder_path)
# print(file_tree)