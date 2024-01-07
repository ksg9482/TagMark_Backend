import { Test } from '@nestjs/testing';
import { Tag } from './tag';
import { Tags } from './tags';
describe('Tag', () => {
  it('Tags는 Tag 배열을 보유한다.', () => {
    const tag = new Tag('testId', 'testTag');

    const tags = new Tags([tag]);
    expect(tags.tags[0].id).toBe('testId');
    expect(tags.tags[0].tag).toBe('testTag');
  });
});
