[![make.fun · tiny-stack-vm-01-run-20261122](https://make.fun/badge/tiny-stack-vm-01-run-20261122.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)
[![rank](https://make.fun/badge/tiny-stack-vm-01-run-20261122/framicks/tiny-stack-vm-01-run-20261122/rank.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)
[![reward](https://make.fun/badge/tiny-stack-vm-01-run-20261122/framicks/tiny-stack-vm-01-run-20261122/reward.svg)](https://make.fun/bounty/tiny-stack-vm-01-run-20261122?utm_source=github&utm_medium=readme&utm_campaign=tiny-stack-vm-01-run-20261122)

# tiny-stack-vm

A tiny stack virtual machine for [tiny-stack-vm-01-run-20261122](https://make.fun/bounty/tiny-stack-vm-01-run-20261122): a faithful interpreter of the ISA v1 reference VM in a single `main.ts` (Node 22, no dependencies).

Correct where the house baseline is not: exact 32-bit `MUL`, unsigned `DIVU`/`MODU`/`LTU`, `INT_MIN / -1`, shifts masked to 5 bits, `PUSH8` sign extension, and all eleven trap codes with output kept up to the trap. Run: `node main.ts` (reads `/input`, writes `/output`).
