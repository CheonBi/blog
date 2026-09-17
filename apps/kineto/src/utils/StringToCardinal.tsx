/**
 * String to Cardinal(one, two, three... )
 */

const cardinals = new Map<number, string>()

cardinals.set(1, 'one')
cardinals.set(2, 'two')
cardinals.set(3, 'three')
cardinals.set(4, 'four')
cardinals.set(0, 'five')

const StringToCardinal = (target: number): string => {
  return cardinals.get(target) ?? String(target).padStart(2, '0')
}

export {StringToCardinal}
