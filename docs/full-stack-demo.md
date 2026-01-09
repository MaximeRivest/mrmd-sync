# Full Stack Demo

Welcome to the **mrmd** full stack demo! This demonstrates:

- **mrmd-editor**: Collaborative markdown editor with Yjs
- **mrmd-sync**: Document synchronization server
- **mrmd-python**: Python runtime (MRP protocol)
- **mrmd-js**: JavaScript/HTML/CSS runtime

## Python Cell

```python
import math

# Variables persist across cells
x = 42
y = math.pi
name = "mrmd"

print(f"Hello from {name}!")
print(f"x = {x}, y = {y:.4f}")

# Return value is displayed
x * y
```

```output
Hello from mrmd!
x = 42, y = 3.1416
Out[1]: 131.94689145077132
```

## JavaScript Cell

```javascript
// Variables persist in JavaScript too
const greeting = "Hello from JavaScript!";
console.log(greeting);

// Do some computation
const numbers = [1, 2, 3, 4, 5];
const sum = numbers.reduce((a, b) => a + b, 0);
console.log("Sum:", sum);

// Return value
{ greeting, sum }
```

```output
Hello from JavaScript!
Sum: 15
```

## HTML Preview

```html
<div style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 8px; color: white;">
  <h2 style="margin: 0 0 10px 0;">Live HTML Preview</h2>
  <p style="margin: 0;">This HTML is rendered in an iframe!</p>
  <button onclick="alert('Clicked!')" style="margin-top: 10px; padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer;">
    Click me
  </button>
</div>
```

```output
[HTML rendered in iframe]
```

## CSS Styling

fdsfdsfds

```css
/* CSS cells apply styles to the page */
.demo-box {
  padding: 1336px;
  background: #238636;
  color: white;
  border-radius: 80px;
  margin: 100px ;
}
```

```output
[CSS applied to page]
```

## More Python

```python
# Access previously defined variables
print(f"x is still {x}")

# Create a list
items = ["apple", "banana", "cherry"]
for i, item in enumerate(items, 1):
    print(f"{i}. {item}")

len(items)
```

```output
x is still 42
1. apple
2. banana
3. cherry
Out[2]: 3
```

## Notes

- All edits sync in real-time via Yjs
- Output blocks are part of the document
- Open multiple browser tabs to test collaboration
- Cursors and selections are shared via Awareness

```python
import time
print
time.sleep(2)
```

```output
```
