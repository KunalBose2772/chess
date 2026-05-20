/**
 * Elo rating calculation as specified in the documentation.
 * E_A = 1/(1+10^((R_B - R_A)/400))
 * new_R_A = R_A + K*(score_A - E_A)
 */
export function calculateElo(
  ratingA: number,
  ratingB: number,
  result: '1-0' | '0-1' | '1/2-1/2',
  perspective: 'white' | 'black',
  K = 32
): number {
  const [myRating, oppRating] =
    perspective === 'white' ? [ratingA, ratingB] : [ratingB, ratingA]

  const expected = 1 / (1 + Math.pow(10, (oppRating - myRating) / 400))

  let score: number
  if (result === '1/2-1/2') {
    score = 0.5
  } else if (
    (result === '1-0' && perspective === 'white') ||
    (result === '0-1' && perspective === 'black')
  ) {
    score = 1
  } else {
    score = 0
  }

  return Math.round(myRating + K * (score - expected))
}
