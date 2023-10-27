import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NbAuthService, NbLoginComponent, NbRegisterComponent, NB_AUTH_OPTIONS } from '@nebular/auth';
import { ApiService } from '../../../../service/auth/api.service';

@Component({
  selector: 'ngx-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent extends NbRegisterComponent implements OnInit {

  constructor(private fb: UntypedFormBuilder, private apiService: ApiService, service: NbAuthService, @Inject(NB_AUTH_OPTIONS) options: {}, cd: ChangeDetectorRef, router: Router) {
    super(service, options, cd, router);
  }
  ngOnInit(): void {
  }

  register() {
    this.user.createdBy = 'admin'
    this.user.updatedBy = 'admin'
   // this.user.lastName = this.user.fullName
    this.user.fullName = this.user.firstName + this.user.lastName
    this.apiService.registerUser(this.user)
      .subscribe(data => {
        console.log(data)
        this.router.navigateByUrl('/pages/dashboard')
      })
  }

}
