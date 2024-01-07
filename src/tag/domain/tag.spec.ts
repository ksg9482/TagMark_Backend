import { Test } from '@nestjs/testing';
import { Tag } from '../domain/tag';
describe('Tag', () => {
  it('Tag는 id와 tag를 보유한다.', () => {
    const tag = new Tag('testId', 'testTag');

    expect(tag.id).toBe('testId');
    expect(tag.tag).toBe('testTag');
  });
});
