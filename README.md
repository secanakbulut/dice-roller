# dice roller

small thing I made one evening because I wanted to know if the d20 from my dnd set is actually fair. spoiler, after a few hundred rolls it looks fine. it is just unlucky.

## what it does

- pick a die (d4, d6, d8, d10, d12, d20) and how many to roll at once, up to four
- big number for the total
- keeps a tally per face in localStorage so it survives a reload
- shows the running average, the expected value for a fair die, and a chi-square statistic
- tells you "looks fair" or "looking suspicious" once you have enough rolls

## the math bit

every time you roll, it counts how often each face came up. for a fair n-sided die you would expect every face to show up about `total_rolls / n` times. the chi-square goodness-of-fit statistic adds up `(observed - expected)^2 / expected` across all faces. if the number is bigger than the table cutoff for `n - 1` degrees of freedom at p = 0.05, that is the "suspicious" line. critical values are hardcoded in the script for d4 through d20, no stats library involved.

it waits until you have at least `5 * sides` rolls before judging, otherwise the verdict is meaningless on tiny samples.

## run it

no build, no install. open the html.

```
git clone https://github.com/secanakbulut/dice-roller.git
cd dice-roller
open index.html
```

stats are saved per die size, so the d6 history does not mix with the d20 history. the clear button only clears the die you are currently looking at.

## files

- `index.html` markup
- `style.css` dark theme, nothing clever
- `script.js` rolling, stats, chi-square

licensed under PolyForm Noncommercial 1.0.0, see LICENSE. personal and hobby use is fine, commercial use is not.

Note: the chi-square check holds off until at least 5 rolls per face so it does not flag a perfectly fine die just because you only rolled it ten times.
