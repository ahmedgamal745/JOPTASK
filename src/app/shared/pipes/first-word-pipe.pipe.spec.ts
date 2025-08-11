import { FirstWordPipe } from './first-word-pipe.pipe';

describe('FirstWordPipePipe', () => {
  it('create an instance', () => {
    const pipe = new FirstWordPipe();
    expect(pipe).toBeTruthy();
  });
});
