import type {JournalPage} from '@/type'

const titles: string[] = [
  '지나간 순간들',
  '기억하고 싶은 순간들',
  '평범했던 하루',
  '사라지지 않는 기억',
  '저마다의 이야기',
  '시간 속의 재회',
  '과거를 만나는 방법',
  '순간의 기록',
  '천천히 돌아보기',
  '내일의 기억',
  '사라지는 순간들',
  '흐르는 시간, 남는 기록',
  '남기고 싶은 것들',
  '기억을 위한 노력',
  '잊고 싶지 않은 순간들',
  '지나온 시간의 흔적',
  '오래 남은 기억',
  '기록하지 못한 순간들',
  '뒤늦게 소중해진 순간들',
  '그때는 몰랐던 소중함',
]

const pages: JournalPage[] = Array.from({length: 20}, (_, index) => ({
  id: index + 1,
  title: `Journal ${String(index + 1).padStart(2, '0')}`,
}))

export {pages, titles}
