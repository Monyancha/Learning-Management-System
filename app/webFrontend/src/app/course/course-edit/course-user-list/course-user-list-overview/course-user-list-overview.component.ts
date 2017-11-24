import {Component, Input, Output, OnInit, ViewEncapsulation, EventEmitter} from '@angular/core';
import {ICourse} from '../../../../../../../../shared/models/ICourse';
import {IUser} from '../../../../../../../../shared/models/IUser';
import {DialogService} from '../../../../shared/services/dialog.service';

@Component({
  selector: 'app-course-user-list-overview',
  templateUrl: './course-user-list-overview.component.html',
  styleUrls: ['./course-user-list-overview.component.scss']
})
export class CourseUserListOverviewComponent implements OnInit {

  @Input() users: IUser[];
  @Output() onUpdate = new EventEmitter<String>();
  currentUser: IUser = null;

  constructor(private dialogService: DialogService) {
  }

  ngOnInit() {
  }

  setCurrentUser(user: IUser) {
    this.currentUser = user;
  }

  removeUser() {
    this.dialogService
      .confirmRemove(this.currentUser.role, this.currentUser.email, 'course')
      .subscribe(res => {
        if (res) {
          this.onUpdate.emit(this.currentUser._id);
        }
      });
  }

}
