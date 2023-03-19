| Language | Lines  | Words   | Characters |
| -------- | ------ | ------- | ---------- |
| TSX      | 620    | 2,130   | 18,589     |
| TS       | 9      | 45      | 355        |
| CSS      | 247    | 513     | 4,096      |
| PY       | 386    | 1,605   | 21,813     |
| CSV      | 575    | 4,093   | 137,052    |
| JSON     | 34,548 | 205,980 | 2,195,553  |

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
