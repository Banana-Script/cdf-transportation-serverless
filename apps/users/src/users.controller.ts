import { DatabaseService } from '@app/database';
import { User } from '@app/database/entities/user.entity';
import { JwtAuthGuard } from '@auth/auth/groups.guard';
import { Controller, UseGuards } from '@nestjs/common';
import { Crud, CrudAuth, CrudController } from '@dataui/crud';
import { UsersService } from './users.service';

@Crud({
  model: {
    type: User,
  },
  query: {
    alwaysPaginate: false,
    join: {},
  },
})
@CrudAuth({
  persist: (e) => {
    switch (e.method) {
      case 'POST':
        return {
          creator_user: e.user.sub,
          created_at: new Date(),
        };
      default:
        return {
          modifier_user: e.user.sub,
          updated_at: new Date(),
        };
    }
  },
})
@UseGuards(JwtAuthGuard)
@Controller({ path: 'api' })
export class UsersController implements CrudController<User> {
  constructor(
    public service: UsersService,
    public dbService: DatabaseService,
  ) {}

  get base(): CrudController<User> {
    return this;
  }
}
