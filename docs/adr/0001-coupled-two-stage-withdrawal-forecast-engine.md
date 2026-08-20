# Coupled two-stage Withdrawal Forecast engine

The Withdrawal Forecast runs a single GBM engine across both the accumulation and decumation phases, with one continuous shock sequence carrying through the phase switch. The alternative — composing the existing Accumulation Forecast with a new decumation-only sim, seeding the latter from the former's median terminal value — would silently sever the correlation between phases and understate lifecycle tail risk, which is the dangerous direction for the early-accumulator population this feature primarily serves.
