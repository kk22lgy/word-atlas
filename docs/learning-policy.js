// Standalone function words and alphabet entries are excluded from study lists.
// They remain available through sentence lookup and archived progress records.
export const foundationWords = new Set(
  `
a an the am is are was were be been being do does did done have has had having
i me my mine myself we us our ours ourselves you your yours yourself yourselves
he him his himself she her hers herself it its itself they them their theirs themselves
this that these those and or but if as of at by in on to for from with into onto upon
can could may might must shall should will would ought yes no not so than then
what who whom whose which where when why how here there now very too also just
one two three four five six seven eight nine ten first second third
good bad big small old new hot cold go come get put take make see say tell
quick slow happy sad easy hard early late hello hi goodbye bye please thanks thank
boy girl man woman baby mom dad mother father sister brother son daughter
red blue green black white yellow pink brown orange purple
day week month year today yesterday tomorrow morning afternoon evening night
eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty
thirty forty fifty sixty seventy eighty ninety hundred thousand
eat drink sleep walk run sit stand read write speak listen look watch want like love
more most less least much many little few all some any each every other another
up down out off over under again only even almost already always never often sometimes
`
    .trim()
    .split(/\s+/),
);
export function isFoundationWord(word) {
  const normalized = String(word).trim().toLowerCase();
  return /^[a-z]$/.test(normalized) || foundationWords.has(normalized);
}
