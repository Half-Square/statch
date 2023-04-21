/*****************************************************************************
 * @Author                : Adrien Lanco<adrienlanco0@gmail.com>             *
 * @CreatedDate           : 2023-03-20 09:41:42                              *
 * @LastEditors           : Adrien Lanco<adrienlanco0@gmail.com>             *
 * @LastEditDate          : 2023-04-18 17:22:53                              *
 ****************************************************************************/

import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommandService } from 'src/app/services/command/command.service';
import { ProjectListService, TicketInterface, VersionInterface } from 'src/app/services/project-list/project-list.service';

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss']
})
export class TicketComponent {

  constructor(private route: ActivatedRoute,
              private router: Router,
              public command: CommandService) {
    this.route.queryParams
    .subscribe((params: any) => {
      if (params.edit) this.onEdit = params.edit
      else this.onEdit = false
    });
    ProjectListService.ticketChange.subscribe((value: TicketInterface) => {
      this.ticket = structuredClone(value);
    })
  }

  public onEdit: boolean = false;
  public windowWidth: boolean = true;

  public id: string = "";
  public ticket: TicketInterface = {} as TicketInterface;

  public nbTicket: number = 0;

  public activity : any = [];

  public comments: any = [];

  async ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id') || "";
    if(window.innerWidth <= 1024) {
      this.windowWidth = false;
    }
    window.onresize = () => this.windowWidth = window.innerWidth >= 1024;
  }

  public saveTicket() {
    this.command.editTicket(this.ticket)
    .then((ret) => {
      this.ticket = ret
    })
  }

  public redirectToEdit() {
    this.router.navigate(
      [ "ticket", this.ticket.id ],
      { queryParams: { edit: true } }
    )
  }

  public getTicketVersion(): VersionInterface {
    if (this.ticket.targetVersion)
      return this.ticket.targetVersion

    return { id: "", name: "", projectId: "" } as VersionInterface;
  }

  public changeTicketVersion(change: any): void {
    this.ticket.targetVersion = change;
    this.command.editTicket(this.ticket)
  }
}
