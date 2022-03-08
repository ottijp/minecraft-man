const notifier = require('../lib/minecraft-join-notifier/index')

describe('joinedUser', () => {
  test('returns joined user', () => {
    expect(notifier.joinedUser('[15:01:14] [Server thread/INFO]: ottijp joined the game')).toBe('ottijp')
  })

  test('returns null in case the log conversation', () => {
    expect(notifier.joinedUser('[09:56:24] [Server thread/INFO]: <ottijp> ｗｗ')).toBeNull()
  })
})
