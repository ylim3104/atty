from setuptools import setup, find_packages
import os

# Read the contents of your requirements file, if you have one
# (For now, we just need basic standard library stuff plus whatever you add for Ollama later)

setup(
    name='atty-lang',
    version='1.0.0',
    description='A multilingual Python interpreter for Korean, Spanish, and Farsi',
    author='Atty HackTheBreak',
    # Since your script is currently named interpreter.py, we include it as a module
    py_modules=['interpreter'],

    # We also need to make sure the dicts folder gets installed alongside the script
    # For a standalone script not in a package folder, data_files is an easy way to move them
    # But to be safe across platforms, it's better to structure as a package if it gets complex.
    # For now, we'll try including them as package_data if we treat the root as a package, 
    # or just copy them. The simplest hackathon approach is to put the script in a folder.

    # Register the CLI command 'atty'
    entry_points={
        'console_scripts': [
            # This tells the system: when the user types 'atty', 
            # run the 'main()' function inside 'interpreter.py'
            'atty=interpreter:main',
        ],
    },

    # Ensure your JSON dictionaries are included when installed
    # We use a trick here since it's a flat directory
    data_files=[
        ('dicts', ['dicts/kr_en.json', 'dicts/es_en.json', 'dicts/fa_en.json'])
    ],

    classifiers=[
        'Programming Language :: Python :: 3',
        'Operating System :: OS Independent',
    ],
)
