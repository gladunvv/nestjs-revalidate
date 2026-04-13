import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RevalidateInterceptor } from '../interceptor/revalidate.interceptor';
import { REVALIDATE_MODULE_OPTIONS } from './revalidate.constants';
import { RevalidateModuleOptions } from './revalidate.interfaces';

@Global()
@Module({})
export class RevalidateModule {
  static forRoot(options: RevalidateModuleOptions = {}): DynamicModule {
    const optionsProvider: Provider = {
      provide: REVALIDATE_MODULE_OPTIONS,
      useValue: options,
    };

    const interceptorProvider: Provider = {
      provide: APP_INTERCEPTOR,
      useClass: RevalidateInterceptor,
    };

    return {
      module: RevalidateModule,
      providers: [optionsProvider, interceptorProvider],
      exports: [optionsProvider],
    };
  }
}
