import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { EMPTY, from, Observable, of } from 'rxjs';
import { map, mergeMap, throwIfEmpty } from 'rxjs/operators';
import { USER_MODEL } from '../database/database.constants';
import { User, UserModel } from '../database/user.model';
import { RoleType } from '../shared/enum/role-type.enum';
import { RegisterDto } from './register.dto';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_MODEL) private userModel: UserModel,
  ) {}

  findByUsername(username: string): Observable<User> {
    return from(this.userModel.findOne({ username }).exec());
  }

  // since mongoose 6.2, `Model.exists` is chagned to return a lean document with `_id` or `null`
  existsByUsername(username: string): Observable<boolean> {
    return from(this.userModel.exists({ username }).exec()).pipe(
      map((exists) => exists != null),
    );
  }

  existsByEmail(email: string): Observable<boolean> {
    return from(this.userModel.exists({ email }).exec()).pipe(
      map((exists) => exists != null),
    );
  }

  register(data: RegisterDto): Observable<User> {
    // Simply here we can send a verification email to the new registered user
    // by calling SendGrid directly.
    //
    // In a microservice application, you can send this msg to a message broker
    // then subsribe it in antoher (micro)service and send the emails.

    // Use base64 to genrate a random string
    // const randomCode = btoa(Math.random().toString()).slice(0, 4);
    // console.log(`random code:${randomCode}`);

    // const created = this.userModel.create({
    //   ...data,
    //   verified: false,
    //   verifyCode: randomCode,
    //   roles: [RoleType.USER]
    // });

    const created = this.userModel.create({
      ...data,
      roles: [RoleType.USER],
    });

    return from(created);
  }

  findById(id: string, withPosts = false): Observable<User> {
    const userQuery = this.userModel.findOne({ _id: id });
    if (withPosts) {
      userQuery.populate('posts');
    }
    return from(userQuery.exec()).pipe(
      mergeMap((p) => (p ? of(p) : EMPTY)),
      throwIfEmpty(() => new NotFoundException(`user:${id} was not found`)),
    );
  }
}
