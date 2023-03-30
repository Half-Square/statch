/*****************************************************************************
 * @Author                : Adrien Lanco<adrienlanco0@gmail.com>             *
 * @CreatedDate           : 2023-03-17 15:22:52                              *
 * @LastEditors           : Adrien Lanco<adrienlanco0@gmail.com>             *
 * @LastEditDate          : 2023-03-30 10:24:35                              *
 ****************************************************************************/

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

export interface UserInterface {
  "id":    string;
  "name":  string;
  "email": string;
  "token"?: string;
  "validate": boolean;
  "isAdmin": boolean;
}


@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor() {
  }

  private static is_connected: boolean = false;

  private static user: UserInterface;

  /**
  * @name init
  * @descr init user from sessionStorage
  *
  */
  public static init() {
    let user = sessionStorage.getItem('user');
    if (user)
      this.setUser(JSON.parse(user));
  }
  /***/

  /**
  * @name isConnected
  * @descr return connected state
  *
  * @returns
  */
  public static isConnected(): boolean {
    return this.is_connected;
  }
  /***/

  /**
  * @name setUser
  * @descr set user on sessionStorage
  *
  * @param data (UserInterface): user data
  */
  public static setUser(data: UserInterface) {
    if (data.name && data.token) {
      this.is_connected = true;
      this.user = data;
      sessionStorage.setItem('user', JSON.stringify(this.user));
    }
  }
  /***/

  /**
  * @name getUser
  * @descr return private user
  *
  */
  public static getUser(): UserInterface {
    return this.user;
  }
  /***/

  /**
  * @name init
  * @descr init user from sessionStorage
  *
  */
  public static disconnect(router: Router): void {
    sessionStorage.removeItem('user');
    this.user = {} as UserInterface;

    this.is_connected = false;
    router.navigate(['/login'])
  }
}
