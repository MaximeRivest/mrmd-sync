# Minimal Full Stack Demo

This is the mrmd editor with **all defaults** - no custom styling.

## Python

```python
import math
x = 33
print(f"The answer is {x}")
math.sqrt(x)
```

```output
The answer is 33
Out[21]: 5.744562646538029
```
yesyeyseys
fd
```html
<p>hello something</p>
```

```output
<p>hello something</p>
```


<p>hello</p>


```css
h2 {color: blue}
```

```output
CSS: 1 rule
```


## JavaScript

```javascript
const items = ["apple", "banana", "cherry"];
console.log("Items:", items.join(", "));
items.length+132
```

```output
Items: apple, banana, cherry
135
```

## Markdown

- Lists work
- **Bold** and *italic*
- `inline code`

> Blockquotes too

---

Press **Shift+Enter** to run a code cell.

i am adding shit here!!


# Rich Progress Bars & Interactivity Guide

A comprehensive guide to Rich's progress bars, spinners, and interactive elements.

## Installation

```bash
pip install rich
```

---

## 1. Simple Progress with `track()`

The easiest way to add progress to any iterable:

```python
from rich.progress import track
import time

for item in track(range(100), description="Processing..."):
    time.sleep(0.02)
```

```output
Processing... [38;2;114;156;31m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [35m100%[0m [33m0:00:02[0m
```

With custom styling:

```python
from rich.progress import track

data = ["file1.txt", "file2.txt", "file3.txt", "file4.txt"]

for filename in track(data, description="[cyan]Reading files..."):
    process_file(filename)
```

```output
[36mReading files...[0m [38;5;237m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [35m  0%[0m [36m-:--:--[0m
[31m---------------------------------------------------------------------------[0m
[31mNameError[0m                                 Traceback (most recent call last)
[36mCell [32mIn[15], line 6[0m
[32m      3[0m data = [[33m"file1.txt"[0m, [33m"file2.txt"[0m, [33m"file3.txt"[0m, [33m"file4.txt"[0m]
[32m      5[0m [1;38;5;28mfor[0m filename [1;38;5;129min[0m track(data, description=[33m"[cyan]Reading files..."[0m):
[32m----> 6[0m     [43mprocess_file[0m(filename)

[31mNameError[0m: name 'process_file' is not defined
[Error: name 'process_file' is not defined]
```

---

## 2. Basic Progress Context Manager

For more control, use the `Progress` context manager:

```python
from rich.progress import Progress
import time

with Progress() as progress:
    task = progress.add_task("[green]Downloading...", total=100)
    
    while not progress.finished:
        progress.update(task, advance=0.5)
        time.sleep(0.01)
```

```output
[32mDownloading...[0m [38;2;114;156;31m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [35m100%[0m [36m0:00:00[0m
```

---

## 3. Multiple Concurrent Progress Bars

Track several tasks simultaneously:

```python
from rich.progress import Progress
import time
import random

with Progress() as progress:
    task1 = progress.add_task("[red]Compiling...", total=100)
    task2 = progress.add_task("[green]Linking...", total=100)
    task3 = progress.add_task("[blue]Installing...", total=100)
    
    while not progress.finished:
        progress.update(task1, advance=random.uniform(0.5, 1.5))
        progress.update(task2, advance=random.uniform(0.3, 1.0))
        progress.update(task3, advance=random.uniform(0.1, 0.8))
        time.sleep(0.02)
```

```output
[31mCompiling...[0m  [38;2;114;156;31m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [35m100%[0m [36m0:00:00[0m
[32mLinking...[0m    [38;2;114;156;31m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [35m100%[0m [36m0:00:00[0m
[34mInstalling...[0m [38;2;114;156;31m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [35m100%[0m [36m0:00:00[0m
```

---

## 4. Custom Column Configuration

Build custom progress displays with various columns:

```python
from rich.progress import (
    Progress,
    SpinnerColumn,
    BarColumn,
    TextColumn,
    TimeElapsedColumn,
    TimeRemainingColumn,
    MofNCompleteColumn,
    TaskProgressColumn,
)
import time

progress = Progress(
    SpinnerColumn(),
    TextColumn("[bold blue]{task.description}"),
    BarColumn(bar_width=40),
    TaskProgressColumn(),
    TimeElapsedColumn(),
    TimeRemainingColumn(),
    MofNCompleteColumn(),
)

with progress:
    task = progress.add_task("Processing files", total=50)
    for i in range(50):
        time.sleep(0.05)
        progress.update(task, advance=1)
```

```output
  [1;34mProcessing files[0m [38;2;114;156;31m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [35m100%[0m [33m0:00:02[0m [36m0:00:00[0m [32m50/50[0m
```

---

## 5. Download-Style Progress

Show transfer speed and file sizes:

```python
from rich.progress import (
    Progress,
    SpinnerColumn,
    TextColumn,
    BarColumn,
    DownloadColumn,
    TransferSpeedColumn,
    TimeRemainingColumn,
)
import time
import random

progress = Progress(
    SpinnerColumn(),
    TextColumn("[bold cyan]{task.description}"),
    BarColumn(),
    DownloadColumn(),
    TransferSpeedColumn(),
    TimeRemainingColumn(),
)

with progress:
    # Simulate 50MB download
    task = progress.add_task("Downloading data.zip", total=50_000_000)
    
    while not progress.finished:
        chunk = random.randint(100_000, 500_000)
        progress.update(task, advance=chunk)
        time.sleep(0.02)
```

```output
  [1;36mDownloading data.zip[0m [38;2;114;156;31m━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [32m50.1/50.0 MB[0m [31m14.5 MB/s[0m [36m0:00:00[0m
```

---

## 6. Indeterminate Progress (Unknown Total)

When you don't know how long a task will take:

```python
from rich.progress import Progress, SpinnerColumn, TextColumn
import time

with Progress(
    SpinnerColumn(),
    TextColumn("[bold magenta]{task.description}"),
    transient=True,  # Clears when done
) as progress:
    task = progress.add_task("Searching...", total=None)
    
    # Simulate unknown duration work
    for _ in range(50):
        time.sleep(0.05)
    
    progress.update(task, description="[green]Found!")
    time.sleep(0.5)
```

```output
```

 a spinner:

```python
from rich.console import Console
from rich.status import Status
import time

console = Console()

with console.status("[bold green]Working on it...") as status:
    time.sleep(2)
    status.update("[bold blue]Still processing...")
    time.sleep(2)
    status.update("[bold yellow]Almost done...")
    time.sleep(1)

console.print("[bold green]✓ Done!")
```

```output
[1;32m✓ Done![0m
```

Different spinner styles:

```python
from rich.console import Console
import time

console = Console()

spinners = ["dots", "line", "dots12", "arrow3", "bouncingBall", "moon", "runner"]

for spinner in spinners:
    with console.status(f"Spinner: {spinner}", spinner=spinner):
        time.sleep(1.5)
```

```output
```

---

## 8. Interactive Prompts

Get user input with style:

```python
from rich.prompt import Prompt, Confirm, IntPrompt, FloatPrompt
from rich.console import Console

console = Console()

# Text prompt
name = Prompt.ask("What is your name")

# With default value
city = Prompt.ask("Where do you live", default="New York")

# With choices
color = Prompt.ask("Pick a color", choices=["red", "green", "blue"])

# Password input
password = Prompt.ask("Enter password", password=True)

# Integer prompt with validation
age = IntPrompt.ask("How old are you")

# Confirmation
if Confirm.ask("Do you want to continue?"):
    console.print("[green]Proceeding...")
else:
    console.print("[red]Cancelled.")
```

```output
What is your name: maxime
Where do you live [1;36m(New York)[0m: gat
Pick a color [1;35m[red/green/blue][0m: redd
[31mPlease select one of the available options[0m
Pick a color [1;35m[red/green/blue][0m: red
Enter password: /home/maxime/.local/share/uv/python/cpython-3.13.3-linux-x86_64-gnu/lib/python3.13/getpass.py:90: GetPassWarning: Can not control echo on the terminal.
  passwd = fallback_getpass(prompt, stream)
Warning: Password input may be echoed.
[31m---------------------------------------------------------------------------[0m
[31merror[0m                                     Traceback (most recent call last)
[36mFile [32m~/.local/share/uv/python/cpython-3.13.3-linux-x86_64-gnu/lib/python3.13/getpass.py:68[0m, in [36munix_getpass[34m(prompt, stream)[0m
[32m     67[0m [1;38;5;28mtry[0m:
[32m---> 68[0m     old = [43mtermios.tcgetattr(fd)[0m     [3;38;5;66m# a copy to save[0m
[32m     69[0m     new = old[:]

[31merror[0m: (25, 'Inappropriate ioctl for device')

During handling of the above exception, another exception occurred:

[31mEOFError[0m                                  Traceback (most recent call last)
[36mCell [32mIn[17], line 16[0m
[32m     13[0m color = Prompt.ask([33m"Pick a color"[0m, choices=[[33m"red"[0m, [33m"green"[0m, [33m"blue"[0m])
[32m     15[0m [3;38;5;66m# Password input[0m
[32m---> 16[0m password = [43mPrompt.ask([33m"Enter password"[0;43m, password=[1;38;5;28mTrue[0;43m)[0m
[32m     18[0m [3;38;5;66m# Integer prompt with validation[0m
[32m     19[0m age = IntPrompt.ask([33m"How old are you"[0m)

[36mFile [32m~/Projects/mrmd-packages/mrmd-python/.venv/lib/python3.13/site-packages/rich/prompt.py:149[0m, in [36mPromptBase.ask[34m(cls, prompt, console, password, choices, case_sensitive, show_default, show_choices, default, stream)[0m
[32m    125[0m [3;33m"""Shortcut to construct and run a prompt loop and return the result.[0m
[32m    126[0m 
[32m    127[0m [3;33mExample:[0m
[32m   (...)    138[0m [3;33m    stream (TextIO, optional): Optional text file open for reading to get input. Defaults to None.[0m
[32m    139[0m [3;33m"""[0m
[32m    140[0m _prompt = [38;5;28mcls[0m(
[32m    141[0m     prompt,
[32m    142[0m     console=console,
[32m   (...)    147[0m     show_choices=show_choices,
[32m    148[0m )
[32m--> 149[0m [1;38;5;28mreturn[0m [43m_prompt(default=default, stream=stream)[0m

[36mFile [32m~/Projects/mrmd-packages/mrmd-python/.venv/lib/python3.13/site-packages/rich/prompt.py:292[0m, in [36mPromptBase.__call__[34m(self, default, stream)[0m
[32m    290[0m [38;5;28mself[0m.pre_prompt()
[32m    291[0m prompt = [38;5;28mself[0m.make_prompt(default)
[32m--> 292[0m value = [38;5;28;43mself[0;43m.get_input([38;5;28mself[0;43m.console, prompt, [38;5;28mself[0;43m.password, stream=stream)[0m
[32m    293[0m [1;38;5;28mif[0m value == [33m""[0m [1;38;5;129mand[0m default != ...:
[32m    294[0m     [1;38;5;28mreturn[0m default

[36mFile [32m~/Projects/mrmd-packages/mrmd-python/.venv/lib/python3.13/site-packages/rich/prompt.py:211[0m, in [36mPromptBase.get_input[34m(cls, console, prompt, password, stream)[0m
[32m    193[0m [38;5;129m@classmethod[0m
[32m    194[0m [1;38;5;28mdef[0;38;5;250m [34mget_input[0m(
[32m    195[0m     [38;5;28mcls[0m,
[32m   (...)    199[0m     stream: Optional[TextIO] = [1;38;5;28mNone[0m,
[32m    200[0m ) -> [38;5;28mstr[0m:
[32m    201[0m [38;5;250m    [3;33m"""Get input from user.[0m
[32m    202[0m 
[32m    203[0m [3;33m    Args:[0m
[32m   (...)39m    209[0m [3;33m        str: String from user.[0m
[32m    210[0m [3;33m    """[0m
[32m--> 211[0m     [1;38;5;28mreturn[0m [43mconsole.input(prompt, password=password, stream=stream)[0m

[36mFile [32m~/Projects/mrmd-packages/mrmd-python/.venv/lib/python3.13/site-packages/rich/console.py:2165[0m, in [36mConsole.input[34m(self, prompt, markup, emoji, password, stream)[0m
[32m   2163[0m     [38;5;28mself[0m.print(prompt, markup=markup, emoji=emoji, end=[33m""[0m)
[32m   2164[0m [1;38;5;28mif[0m password:
[32m-> 2165[0m     result = [43mgetpass([33m""[0;43m, stream=stream)[0m
[32m   2166[0m [1;38;5;28melse[0m:
[32m   2167[0m     [1;38;5;28mif[0m stream:

[36mFile [32m~/.local/share/uv/python/cpython-3.13.3-linux-x86_64-gnu/lib/python3.13/getpass.py:90[0m, in [36munix_getpass[34m(prompt, stream)[0m
[32m     87[0m         [1;38;5;28mif[0m stream [1;38;5;129mis[0m [1;38;5;129mnot[0m [38;5;28minput[0m:
[32m     88[0m             [3;38;5;66m# clean up unused file objects before blocking[0m
[32m     89[0m             stack.close()
[32m---> 90[0m         passwd = [43mfallback_getpass(prompt, stream)[0m
[32m     92[0m stream.write([33m'[1;38;5;130m\n[0;33m'[0m)
[32m     93[0m [1;38;5;28mreturn[0m passwd

[36mFile [32m~/.local/share/uv/python/cpython-3.13.3-linux-x86_64-gnu/lib/python3.13/getpass.py:126[0m, in [36mfallback_getpass[34m(prompt, stream)[0m
[32m    124[0m     stream = sys.stderr
[32m    125[0m [38;5;28mprint[0m([33m"Warning: Password input may be echoed."[0m, file=stream)
[32m--> 126[0m [1;38;5;28mreturn[0m [43m_raw_input(prompt, stream)[0m

[36mFile [32m~/.local/share/uv/python/cpython-3.13.3-linux-x86_64-gnu/lib/python3.13/getpass.py:148[0m, in [36m_raw_input[34m(prompt, stream, input)[0m
[32m    146[0m line = [38;5;28minput[0m.readline()
[32m    147[0m [1;38;5;28mif[0m [1;38;5;129mnot[0m line:
[32m--> 148[0m     [1;38;5;28mraise[0m [1;38;5;167mEOFError[0m
[32m    149[0m [1;38;5;28mif[0m line[-[32m1[0m] == [33m'[1;38;5;130m\n[0;33m'[0m:
[32m    150[0m     line = line[:-[32m1[0m]

[31mEOFError[0m: 
[Error: ]
```

---

## 9. Live Updating Display

Update any renderable in real-time:

```python
from rich.live import Live
from rich.table import Table
from rich.console import Console
import time
import random

console = Console()

def generate_table() -> Table
    table = Table(title="Live Server Stats")
    table.add_column("Server")
    table.add_column("CPU %", justify="right")
    table.add_column("Memory %", justify="right")
    table.add_column("Status")
    
    servers = ["web-01", "web-02", "db-01", "cache-01"]
    for server in servers:
        cpu = random.randint(10, 95)
        mem = random.randint(20, 85)
        status = "[green]●" if cpu < 80 else "[red]●"
        table.add_row(server, f"{cpu}%", f"{mem}%", status)
    
    return table

with Live(generate_table(), refresh_per_second=4) as live:
    for _ in range(20):
        time.sleep(0.25)
        live.update(generate_table())
```

```output
  [36mCell [32mIn[29], line 9[0m
[31m    def generate_table() -> Table[0m
                                 ^
[31mSyntaxError:[0m expected ':'
[Error: expected ':' (<ipython-input-29-b6b495fdc859>, line 9)]
```

---

## 10. Progress with Live Panel

Combine progress bars with other elements:

```python
from rich.progress import Progress, SpinnerColumn, BarColumn, TextColumn
from rich.panel import Panel
from rich.live import Live
from rich.console import Group
from rich.text import Text
import time

progress = Progress(
    SpinnerColumn(),
    TextColumn("[bold]{task.description}"),
    BarColumn(),
    TextColumn("[progress.percentage]{task.percentage:>3.0f}%"),
)

task = progress.add_task("[cyan]Installing packages...", total=100)
log_messages = []

def make_display():
    log_text = Text("\n".join(log_messages[-5:]))  # Last 5 messages
    return Group(
        Panel(progress, title="Progress", border_style="blue"),
        Panel(log_text, title="Log", border_style="green"),
    )

packages = ["numpy", "pandas", "scipy", "matplotlib", "seaborn", 
            "sklearn", "tensorflow", "torch", "rich", "click"]

with Live(make_display(), refresh_per_second=10) as live:
    for i, pkg in enumerate(packages):
        log_messages.append(f"[green]✓[/] Installed {pkg}")
        progress.update(task, advance=10, description=f"[cyan]Installing {pkg}...")
        live.update(make_display())
        time.sleep(0.3)
```

```output
[34m╭───────────────────────────────────────────────────────────────── Progress ─────────────────────────────────────────────────────────────────╮[0m
[34m│[0m   [1;36mInstalling click...[0m [38;2;114;156;31m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [35m100%[0m                                                                        [34m│[0m
[34m╰────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯[0m
[32m╭─────────────────────────────────────────────────────────────────── Log ────────────────────────────────────────────────────────────────────╮[0m
[32m│[0m [green]✓[/] Installed sklearn                                                                                                              [32m│[0m
[32m│[0m [green]✓[/] Installed tensorflow                                                                                                           [32m│[0m
[32m│[0m [green]✓[/] Installed torch                                                                                                                [32m│[0m
[32m│[0m [green]✓[/] Installed rich                                                                                                                 [32m│[0m
[32m│[0m [green]✓[/] Installed click                                                                                                                [32m│[0m
[32m╰────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────╯[0m
```

---

## 11. Nested Progress Bars

Show progress within progress:

```python
from rich.progress import Progress
import time

with Progress() as progress:
    overall = progress.add_task("[bold blue]Overall", total=3)
    
    for batch_num in range(1, 4):
        batch_task = progress.add_task(f"[cyan]Batch {batch_num}", total=100)
        
        for _ in range(100):
            progress.update(batch_task, advance=1)
            time.sleep(0.01)
        
        progress.update(overall, advance=1)
        progress.remove_task(batch_task)
```

```output
[1;34mOverall[0m [38;2;114;156;31m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [35m100%[0m [36m0:00:00[0m
```

---

## 12. Progress with Task Fields

Add custom fields to progress display:

```python
from rich.progress import Progress, TextColumn, BarColumn, TaskProgressColumn
import time

progress = Progress(
    TextColumn("[bold blue]{task.fields[name]}"),
    BarColumn(),
    TaskProgressColumn(),
    TextColumn("({task.fields[status]})"),
)

with progress:
    task = progress.add_task(
        "work", 
        total=100, 
        name="data.csv",
        status="starting"
    )
    
    for i in range(100):
        if i < 30:
            status = "reading"
        elif i < 70:
            status = "processing"
        else:
            status = "writing"
        
        progress.update(task, advance=1, status=status)
        time.sleep(0.03)
```

```output
[1;34mdata.csv[0m [38;2;114;156;31m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [35m100%[0m (writing)
```

---

## 13. Transient Progress (Disappears When Done)

```python
from rich.progress import Progress
from rich.console import Console
import time

console = Console()

with Progress(transient=True) as progress:
    task = progress.add_task("[green]Loading...", total=100)
    while not progress.finished:
        progress.update(task, advance=1)
        time.sleep(0.02)

console.print("[bold green]✓ Ready to go!")
```

```output
[1;32m✓ Ready to go![0m
```

---

## 14. Progress Bar Styles

Different bar appearances:

```python
from rich.progress import Progress, BarColumn
import time

# ASCII style
with Progress(
    "[progress.description]{task.description}",
    BarColumn(complete_style="green", finished_style="bright_green"),
    "[progress.percentage]{task.percentage:>3.0f}%",
) as progress:
    task = progress.add_task("[cyan]ASCII style", total=100)
    while not progress.finished:
        progress.update(task, advance=2)
        time.sleep(0.02)

# Pulse animation (for indeterminate)
with Progress(
    "[progress.description]{task.description}",
    BarColumn(pulse_style="magenta"),
) as progress:
    task = progress.add_task("[magenta]Pulse effect", total=None)
    for _ in range(50):
        time.sleep(0.05)
```

```output
[36mASCII style[0m [92m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [35m100%[0m
[35mPulse effect[0m [38;2;59;56;59m━[38;2;58;58;58m━[38;2;59;56;59m━[38;2;64;52;64m━[38;2;72;46;72m━[38;2;82;37;82m━[38;2;93;29;93m━[38;2;103;20;103m━[38;2;113;11;113m━[38;2;121;5;121m━[38;2;126;1;126m━[38;2;128;0;128m━[38;2;126;1;126m━[38;2;121;5;121m━[38;2;113;11;113m━[38;2;103;20;103m━[38;2;93;28;93m━[38;2;82;37;82m━[38;2;72;46;72m━[38;2;64;52;64m━[38;2;59;56;59m━[38;2;58;58;58m━[38;2;59;56;59m━[38;2;64;52;64m━[38;2;72;46;72m━[38;2;82;37;82m━[38;2;93;29;93m━[38;2;103;20;103m━[38;2;113;11;113m━[38;2;121;5;121m━[38;2;126;1;126m━[38;2;128;0;128m━[38;2;126;1;126m━[38;2;121;5;121m━[38;2;113;11;113m━[38;2;103;20;103m━[38;2;93;28;93m━[38;2;82;37;82m━[38;2;72;46;72m━[38;2;64;52;64m━[0m
```

---

## 15. Console Print During Progress

Print messages while progress is active:

```python
from rich.progress import Progress
from rich.console import Console
import time
import random

console = Console()

with Progress(console=console) as progress:
    task = progress.add_task("[cyan]Processing...", total=10)
    
    for i in range(10):
        time.sleep(0.3)
        
        # Print will appear above the progress bar
        if random.random() > 0.5:
            progress.console.print(f"[yellow]⚠ Warning at step {i}")
        else:
            progress.console.print(f"[green]✓ Completed step {i}")
        
        progress.update(task, advance=1)
```

```output
[32m✓ Completed step [1m0[0m
[32m✓ Completed step [1m1[0m
[33m⚠ Warning at step [1m2[0m
[33m⚠ Warning at step [1m3[0m
[33m⚠ Warning at step [1m4[0m
[33m⚠ Warning at step [1m5[0m
[32m✓ Completed step [1m6[0m
[32m✓ Completed step [1m7[0m
[32m✓ Completed step [1m8[0m
[32m✓ Completed step [1m9[0m
[36mProcessing...[0m [38;2;114;156;31m━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[0m [35m100%[0m [36m0:00:00[0m
```

---

## 16. Complete Interactive Demo

A full interactive example combining multiple features:

```python
#!/usr/bin/env python3
from rich.console import Console
from rich.progress import (
    Progress, SpinnerColumn, BarColumn, TextColumn,
    TimeElapsedColumn, MofNCompleteColumn
)
from rich.prompt import Prompt, Confirm, IntPrompt
from rich.panel import Panel
from rich.table import Table
from rich.live import Live
import time
import random

console = Console()

def main():
    console.print(Panel.fit(
        "[bold magenta]Rich Progress Demo[/]\n"
        "Interactive demonstration of progress bars",
        border_style="magenta"
    ))
    
    # Get user preferences
    num_tasks = IntPrompt.ask(
        "\nHow many tasks to simulate", 
        default=5,
        choices=[str(i) for i in range(1, 11)]
    )
    
    speed = Prompt.ask(
        "Speed",
        choices=["slow", "medium", "fast"],
        default="medium"
    )
    
    delays = {"slow": 0.1, "medium": 0.03, "fast": 0.01}
    delay = delays[speed]
    
    if not Confirm.ask("\nStart the demo?", default=True):
        console.print("[red]Cancelled.")
        return
    
    console.print()
    
    # Run progress demo
    progress = Progress(
        SpinnerColumn(),
        TextColumn("[bold]{task.description}"),
        BarColumn(bar_width=30),
        MofNCompleteColumn(),
        TimeElapsedColumn(),
    )
    
    results = []
    
    with progress:
        for i in range(1, num_tasks + 1):
            total = random.randint(50, 150)
            task = progress.add_task(f"[cyan]Task {i}", total=total)
            
            start = time.time()
            for _ in range(total):
                progress.update(task, advance=1)
                time.sleep(delay * random.uniform(0.5, 1.5))
            
            elapsed = time.time() - start
            results.append((f"Task {i}", total, f"{elapsed:.2f}s"))
    
    # Show results table
    console.print()
    table = Table(title="Results", show_header=True)
    table.add_column("Task", style="cyan")
    table.add_column("Items", justify="right")
    table.add_column("Time", justify="right", style="green")
    
    for name, items, time_str in results:
        table.add_row(name, str(items), time_str)
    
    console.print(table)
    console.print("\n[bold green]✓ All tasks completed!")

if __name__ == "__main__":
    main()
```

```output
[35m╭────────────────────────────────────────────╮[0m
[35m│[0m [1;35mRich Progress Demo[0m                         [35m│[0m
[35m│[0m Interactive demonstration of progress bars [35m│[0m
[35m╰────────────────────────────────────────────╯[0m

How many tasks to simulate [1;35m[1/2/3/4/5/6/7/8/9/10][0m [1;36m(5)[0m: [31m---------------------------------------------------------------------------[0m
[31mTimeoutError[0m                              Traceback (most recent call last)
[36mFile [32m~/Projects/mrmd-packages/mrmd-python/src/mrmd_python/server.py:293[0m, in [36mMRPServer.handle_execute_stream.<locals>.event_generator.<locals>.on_stdin_request[34m(request)[0m
[32m    291[0m [1;38;5;28mtry[0m:
[32m    292[0m     [3;38;5;66m# Wait up to 5 minutes for input[0m
[32m--> 293[0m     response = [43mconcurrent_future.result(timeout=[32m300[0;43m)[0m
[32m    294[0m     [1;38;5;28mreturn[0m response

[36mFile [32m~/.local/share/uv/python/cpython-3.13.3-linux-x86_64-gnu/lib/python3.13/concurrent/futures/_base.py:458[0m, in [36mFuture.result[34m(self, timeout)[0m
[32m    457[0m         [1;38;5;28melse[0m:
[32m--> 458[0m             [1;38;5;28mraise[0m [1;38;5;167mTimeoutError[0m()
[32m    459[0m [1;38;5;28mfinally[0m:
[32m    460[0m     [3;38;5;66m# Break a reference cycle with the exception in self._exception[0m

[31mTimeoutError[0m: 

During handling of the above exception, another exception occurred:

[31mRuntimeError[0m                              Traceback (most recent call last)
[36mCell [32mIn[25], line 13[0m
[32m     10[0m city = Prompt.ask([33m"Where do you live"[0m, default=[33m"New York"[0m)
[32m     12[0m [3;38;5;66m# With choices[0m
[32m---> 13[0m color = [43mPrompt.ask([33m"Pick a color"[0;43m, choices=[[33m"red"[0;43m, [33m"green"[0;43m, [33m"blue"[0;43m])[0m
[32m     15[0m [3;38;5;66m# Password input[0m
[32m     16[0m password = Prompt.ask([33m"Enter password"[0m, password=[1;38;5;28mTrue[0m)

[36mFile [32m~/Projects/mrmd-packages/mrmd-python/.venv/lib/python3.13/site-packages/rich/prompt.py:149[0m, in [36mPromptBase.ask[34m(cls, prompt, console, password, choices, case_sensitive, show_default, show_choices, default, stream)[0m
[32m    125[0m [3;33m"""Shortcut to construct and run a prompt loop and return the result.[0m
[32m    126[0m 
[32m    127[0m [3;33mExample:[0m
[32m   (...)    138[0m [3;33m    stream (TextIO, optional): Optional text file open for reading to get input. Defaults to None.[0m
[32m    139[0m [3;33m"""[0m
[32m    140[0m _prompt = [38;5;28mcls[0m(
[32m    141[0m     prompt,
[32m    142[0m     console=console,
[32m   (...)    147[0m     show_choices=show_choices,
[32m    148[0m )
[32m--> 149[0m [1;38;5;28mreturn[0m [43m_prompt(default=default, stream=stream)[0m

[36mFile [32m~/Projects/mrmd-packages/mrmd-python/.venv/lib/python3.13/site-packages/rich/prompt.py:292[0m, in [36mPromptBase.__call__[34m(self, default, stream)[0m
[32m    290[0m [38;5;28mself[0m.pre_prompt()
[32m    291[0m prompt = [38;5;28mself[0m.make_prompt(default)
[32m--> 292[0m value = [38;5;28;43mself[0;43m.get_input([38;5;28mself[0;43m.console, prompt, [38;5;28mself[0;43m.password, stream=stream)[0m
[32m    293[0m [1;38;5;28mif[0m value == [33m""[0m [1;38;5;129mand[0m default != ...:
[32m    294[0m     [1;38;5;28mreturn[0m default

[36mFile [32m~/Projects/mrmd-packages/mrmd-python/.venv/lib/python3.13/site-packages/rich/prompt.py:211[0m, in [36mPromptBase.get_input[34m(cls, console, prompt, password, stream)[0m
[32m    193[0m [38;5;129m@classmethod[0m
[32m    194[0m [1;38;5;28mdef[0;38;5;250m [34mget_input[0m(
[32m    195[0m     [38;5;28mcls[0m,
[32m   (...)    199[0m     stream: Optional[TextIO] = [1;38;5;28mNone[0m,
[32m    200[0m ) -> [38;5;28mstr[0m:
[32m    201[0m [38;5;250m    [3;33m"""Get input from user.[0m
[32m    202[0m 
[32m    203[0m [3;33m    Args:[0m
[32m   (...)    209[0m [3;33m        str: String from user.[0m
[32m    210[0m [3;33m    """[0m
[32m--> 211[0m     [1;38;5;28mreturn[0m [43mconsole.input(prompt, password=password, stream=stream)[0m

[36mFile [32m~/Projects/mrmd-packages/mrmd-python/.venv/lib/python3.13/site-packages/rich/console.py:2170[0m, in [36mConsole.input[34m(self, prompt, markup, emoji, password, stream)[0m
[32m   2168[0m         result = stream.readline()
[32m   2169[0m     [1;38;5;28melse[0m:
[32m-> 2170[0m         result = [38;5;28;43minput[0;43m()[0m
[32m   2171[0m [1;38;5;28mreturn[0m result

[36mFile [32m~/Projects/mrmd-packages/mrmd-python/src/mrmd_python/worker.py:783[0m, in [36mIPythonWorker.execute_streaming.<locals>.hooked_input[34m(prompt)[0m
[32m    775[0m request = StdinRequest(
[32m    776[0m     prompt=prompt,
[32m    777[0m     password=[1;38;5;28mFalse[0m,
[32m    778[0m     execId=exec_id [1;38;5;129mor[0m [33m""[0m
[32m    779[0m )
[32m    781[0m [3;38;5;66m# Call the callback and wait for response[0m
[32m    782[0m [3;38;5;66m# The callback is expected to block until input is provided[0m
[32m--> 783[0m response = [43mon_stdin_request(request)[0m
[32m    785[0m [3;38;5;66m# Echo the input (like a terminal would)[0m
[32m    786[0m sys.stdout.write(response)

[36mFile [32m~/Projects/mrmd-packages/mrmd-python/src/mrmd_python/server.py:296[0m, in [36mMRPServer.handle_execute_stream.<locals>.event_generator.<locals>.on_stdin_request[34m(request)[0m
[32m    294[0m     [1;38;5;28mreturn[0m response
[32m    295[0m [1;38;5;28mexcept[0m [1;38;5;167mException[0m [1;38;5;28mas[0m e:
[32m--> 296[0m     [1;38;5;28mraise[0m [1;38;5;167mRuntimeError[0m([33mf"Failed to get input: [1;38;5;132m{[0me[1;38;5;132m}[0;33m"[0m)

[31mRuntimeError[0m: Failed to get input: 
```

---

## Available Spinner Styles

```python
from rich.spinner import SPINNERS

# Print all available spinner names
print(list(SPINNERS.keys()))
```

```output
['dots', 'dots2', 'dots3', 'dots4', 'dots5', 'dots6', 'dots7', 'dots8', 'dots9', 'dots10', 'dots11', 'dots12', 'dots8Bit', 'line', 'line2', 'pipe', 'simpleDots', 'simpleDotsScrolling', 'star', 'star2', 'flip', 'hamburger', 'growVertical', 'growHorizontal', 'balloon', 'balloon2', 'noise', 'bounce', 'boxBounce', 'boxBounce2', 'triangle', 'arc', 'circle', 'squareCorners', 'circleQuarters', 'circleHalves', 'squish', 'toggle', 'toggle2', 'toggle3', 'toggle4', 'toggle5', 'toggle6', 'toggle7', 'toggle8', 'toggle9', 'toggle10', 'toggle11', 'toggle12', 'toggle13', 'arrow', 'arrow2', 'arrow3', 'bouncingBar', 'bouncingBall', 'smiley', 'monkey', 'hearts', 'clock', 'earth', 'material', 'moon', 'runner', 'pong', 'shark', 'dqpb', 'weather', 'christmas', 'grenade', 'point', 'layer', 'betaWave', 'aesthetic']
```

Common ones: `dots`, `dots2`, `dots12`, `line`, `arrow`, `arrow3`, `bouncingBall`, 
`bouncingBar`, `clock`, `earth`, `moon`, `runner`, `pong`, `shark`, `weather`

---

## Quick Reference

| Component | Use Case |
|-----------|----------|
| `track()` | Simple iteration with progress |
| `Progress()` | Full control over progress bars |
| `Status()` | Simple spinner with message |
| `Live()` | Real-time updating displays |
| `Prompt.ask()` | Text input |
| `Confirm.ask()` | Yes/No questions |
| `IntPrompt.ask()` | Integer input |

---

## Tips

1. Use `transient=True` for progress that disappears when done
2. Use `console.print()` inside progress for logging
3. Combine `Live()` with tables for real-time dashboards
4. Use task fields for dynamic descriptions
5. Set `total=None` for indeterminate progress