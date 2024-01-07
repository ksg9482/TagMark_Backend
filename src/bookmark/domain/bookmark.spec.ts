import { Tag } from 'src/tag/domain/tag';
import { Tags } from 'src/tag/domain/tags';
import { Bookmark } from '../domain/bookmark';
describe('Tag', () => {
  it('Bookmark는 id, userId, url, tags를 보유한다.', () => {
    const testTags = new Tags([]);
    const bookmark = Bookmark.from('testId', 'testUserId', 'testUrl', testTags);

    expect(bookmark.id).toBe('testId');
    expect(bookmark.userId).toBe('testUserId');
    expect(bookmark.url).toBe('testUrl');
    expect(bookmark.tags).toStrictEqual([]);
  });

  it('url을 변경할 수 있다', () => {
    const testTags = new Tags([]);
    const bookmark = Bookmark.from('testId', 'testUserId', 'testUrl', testTags);

    bookmark.updateUrl('changedUrl');
    expect(bookmark.url).toBe('changedUrl');
  });

  it('tags를 변경할 수 있다', () => {
    const testTags = new Tags([]);
    const bookmark = Bookmark.from('testId', 'testUserId', 'testUrl', testTags);

    const changedTags = new Tags([new Tag('changedId', 'changedTag')]);
    bookmark.updateTags(changedTags);
    expect(bookmark.tags[0]).toStrictEqual(new Tag('changedId', 'changedTag'));
  });
});
