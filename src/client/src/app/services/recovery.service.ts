/*****************************************************************************
 * @Author                : Jbristhuille<jean-baptiste@halfsquare.fr>        *
 * @CreatedDate           : 2023-05-31 12:56:22                              *
 * @LastEditors           : Jbristhuille<jean-baptiste@halfsquare.fr>        *
 * @LastEditDate          : 2023-11-14 10:21:55                              *
 ****************************************************************************/

/* SUMMARY
  * Imports
  * Services
  * Interfaces
  * Init socket for data recovery
  * Handle socket events
  * Catch data change and allow subcription
  * Subscribe to single ressource
  * Get collection sync
  * Wait collection
  * Get data in collection
*/

/* Imports */
import { Injectable } from "@angular/core";
import { Observable, Subscriber } from "rxjs";
import * as _ from "lodash";
import { Socket, SocketOptions } from "socket.io-client";
/***/

/* Services */
import { SocketService } from "./socket.service";
import { RequestService } from "./request.service";
import { UserService } from "./user.service";
/***/

/* Interfaces */
interface IServerOptions {
  apiUrl: string,
  socketUrl: string,
  socketOpt?: SocketOptions
}
/***/

/* eslint-disable  @typescript-eslint/no-explicit-any */
@Injectable({
  providedIn: "root"
})
export class RecoveryService {
  private data: any = {};
  private socket: Socket | undefined;
  private options: IServerOptions | undefined;
  private socketEvt: string[] = []; // Manage socket listener

  constructor(
    private mySocket: SocketService,
    private api: RequestService,
    private user: UserService
  ) {}

  /**
  * Init socket for data recovery
  * @param options - Server and socket informations and options
  * @param force - Force re-init
  */
  public init(options: IServerOptions, force?: boolean): void {
    if (!this.socket || force) {
      this.options = options;
      this.socket = this.mySocket.connect(
        this.options.socketUrl,
        this.options.socketOpt || {}
      ); // Connect socket
    }
  }
  /***/

  /**
  * Handle socket events
  * @param observer - Data subscriber
  * @param name - Ressource name
  */
  private handleSocketEvents(
    observer: Subscriber<any[]>,
    name: string,
    id?: string): void {
    let evtIndex = _.findIndex(this.socketEvt, (el) => el === name);

    const send = (): void => {
      observer.next(id ? _.find(this.data[name], {id: id}) : this.data[name]);
    };

    if (this.socket && evtIndex === -1) { // Avoid listener duplication
      this.socketEvt.push(name); // Save socket listener

      this.socket.on(name, (data) => {
        this.updateData(data, name);
        send();
      });
    }
  }
  /***/

  /**
  * Update cache data
  * @param data - Item to update
  * @param name - Collection name
  */
  public updateData(data: any, name: string): void {
    let index = _.findIndex(this.data[name], {id: data.id});

    if (index == -1) {
      this.data[name] ? this.data[name].push(data) : this.data[name] = [data];
    } else {
      this.data[name][index] = data;
      _.remove(this.data[name], (el: {deleted?: string}) => el.deleted);
    }
  }
  /***/

  /**
  * Catch data change and allow subcription
  * @param name - Ressource name to observe
  * @return - Data observable
  */
  public get(name: string): Observable<any[]> {
    return new Observable((observer) => {
      if (!this.data[name]) {
        const user = this.user.getUser();
        this.api.get(`api/${name}`, user?.token).then((data) => {
          this.data[name] = data;
          observer.next(this.data[name]);
        });
      } else {
        observer.next(this.data[name] || []);
      }

      this.handleSocketEvents(observer, name);
    });
  }
  /***/

  /**
  * Subscribe to single ressource
  * @param collection - Collection name
  * @param id - Ressource id
  * @return - Data observable
  */
  public getSingle(collection: string, id: string): Observable<any> {
    return new Observable((observer) => {
      if (!this.data[collection]) {
        const user = this.user.getUser();
        this.api.get(`api/${collection}`, user?.token).then((data) => {
          this.data[collection] = data;
          observer.next(_.find(this.data[collection], {id: id}));
        });
      } else {
        observer.next(_.find(this.data[collection], {id: id}));
      }

      this.handleSocketEvents(observer, collection, id);

      return (() => {
        this.socket?.removeAllListeners(collection);
      });
    });
  }
  /***/

  /**
  * Get collection sync
  * @param collection - Collection name
  * @return - Raw data
  */
  public async getSync(collection: string): Promise<unknown[]> {
    if(!this.data[collection]) {
      const user = this.user.getUser();
      this.data[collection] = [];
      this.data[collection] = await this.api.get(`api/${collection}`, user?.token);
    }

    return this.data[collection];
  }
  /***/

  /**
  * Wait collection
  * @param collection - Collection to wait
  * @param time - Loop watch time
  * @return - Promise when ressource is avaible
  */
  private wait(collection: string, time: number): Promise<void> {
    return new Promise((resolve) => {
      const maxRetry = 50;
      let retry = 0;
      let inter = setInterval(() => {
        retry++;

        if (this.data[collection] || retry >= maxRetry) {
          clearInterval(inter);
          return resolve();
        }
      }, time);
    });
  }
  /***/

  /**
  * Get data in collection
  * @param collection - Collection name
  * @param id - Ressource id
  * @returns - Raw data
  */
  public getSingleSync(collection: string, id: string): Promise<any> {
    return new Promise((resolve) => {
      if (!this.data[collection]) {
        let user = this.user.getUser();
        this.api.get(`api/${collection}`, user?.token).then((data) => {
          this.data[collection] = data;
        });
      }

      this.wait(collection, 10).then(() => {
        return resolve(_.find(this.data[collection], {id: id}) || null);
      });
    });
  }
  /***/
}
