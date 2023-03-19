| Language | Lines  | Words  | Characters |
| -------- | ------ | ------ | ---------- |
| TSX      | 504    | 1,645  | 14,989     |
| TS       | 3      | 11     | 83         |
| CSS      | 237    | 485    | 3,922      |
| PY       | 225    | 1,155  | 13,939     |
| CSV      | 561    | 4,056  | 198,749    |
| JSON     | 20,000 | 90,000 | 1,000,000  |

Command:

```
cd src
dir -Recurse *.tsx* | Get-Content | Measure-Object -Line -Word -Char

cd utils
dir -Recurse *.ts* | Get-Content | Measure-Object -Line -Word -Char

cd ..
dir -Recurse *.css* | Get-Content | Measure-Object -Line -Word -Char

cd resources
dir -Recurse *.py* | Get-Content | Measure-Object -Line -Word -Char
dir -Recurse *.csv* | Get-Content | Measure-Object -Line -Word -Char
dir -Recurse *.json* | Get-Content | Measure-Object -Line -Word -Char

cd ..
```

```
cd src
dir -Recurse *.jsx* | Get-Content | Measure-Object -Line -Word -Char

cd utils
dir -Recurse *.js* | Get-Content | Measure-Object -Line -Word -Char

cd ..
dir -Recurse *.css* | Get-Content | Measure-Object -Line -Word -Char

cd resources
dir -Recurse *.py* | Get-Content | Measure-Object -Line -Word -Char
dir -Recurse *.csv* | Get-Content | Measure-Object -Line -Word -Char
dir -Recurse *.json* | Get-Content | Measure-Object -Line -Word -Char

cd ..
```
