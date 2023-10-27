import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NbAuthService, NbLoginComponent, NB_AUTH_OPTIONS } from '@nebular/auth';
import { ApiService } from '../../../../service/auth/api.service';

@Component({
  selector: 'ngx-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent extends NbLoginComponent {

  constructor(private fb: UntypedFormBuilder, private apiService: ApiService, service: NbAuthService, @Inject(NB_AUTH_OPTIONS) options: {}, cd: ChangeDetectorRef, router: Router) {
    super(service, options, cd, router);
  }

  ngOnInit(): void {

  }

  login() {
    this.errors=[];
    this.messages=[]; 
    this.apiService.login(this.user)
      .subscribe(data => {      
        console.log(data);
        localStorage.setItem('currentUser', JSON.stringify(data));
        this.messages.push("Login Successfull")
        this.router.navigateByUrl('/pages/dashboard')
      }, error => {
        this.errors.push("Login Failed, Please check the credentials");
      })
  }

}
