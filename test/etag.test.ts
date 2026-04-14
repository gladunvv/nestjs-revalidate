import 'reflect-metadata';
import { REVALIDATE_ETAG_METADATA } from '../src/metadata/metadata.constants';
import { EtagBy } from '../src/decorators/etag-by.decorator';

describe('EtagBy', () => {
  it('stores etag metadata on method', () => {
    const projector = (value: { version: number }) => value.version;

    class TestController {
      @EtagBy(projector, 'weak')
      handler() {}
    }

    const metadata = Reflect.getMetadata(
      REVALIDATE_ETAG_METADATA,
      TestController.prototype.handler,
    );

    expect(metadata).toEqual({
      by: projector,
      mode: 'weak',
    });
  });
});
