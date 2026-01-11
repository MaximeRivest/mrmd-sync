# Monitor Mode Demo

This notebook uses **monitor mode** for execution. The mrmd-monitor process
handles all code execution, so long-running code survives browser disconnects.

## Python (via monitor)

```python
print("Hello from Python!")
import time
for i in range(5):
    print(f"Count: {i}")
    time.sleep(1)
print("Done!")
```

```output:exec-1768139773431-74bjk5
Hello from Python!
Count: 0
Count: 1
Count: 2
Count: 3
Count: 4
Done!
```


## Python with input

```python
name = input("What is your name? ")
print(f"Hello, {name}!")
```

```output:exec-1768139778501-qj7akn
What is your name? Maxou
Hello, Maxou!
```













Press **Shift+Enter** to run a cell. Watch the monitor terminal to see it claim and execute.


```python
  import time
  for i in range(10):
      print(f"\rProgress: {i+1}/10", end="")
      time.sleep(0.5)
  print("\nDone!")
```

```output:exec-1768139755634-1fpcl1
Progress: 10/10
Done!
```

```python
import time
for i in range(10):
    print(f"Step {i+1}/10")
    time.sleep(2)
print("COMPLETED - Browser was disconnected!")
```

```output:exec-1768140054671-967u4p
Step 1/10
Step 2/10
Step 3/10
Step 4/10
Step 5/10
Step 6/10
Step 7/10
Step 8/10
Step 9/10
Step 10/10
COMPLETED - Browser was disconnected!
```

```python

```
