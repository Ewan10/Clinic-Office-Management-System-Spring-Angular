import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { User } from '../../../models/user.model';
import { BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class LoginComponent {
  constructor(private authService: AuthenticationService, private router: Router) { }

  isLoading = false;
  errorMessage: string = null;
  user: User;
  userBehSub = new BehaviorSubject<User>(null);

  onLogin(form: NgForm) {
    const user = {
      userName: form.value.username,
      password: form.value._password
    };
    this.isLoading = true;
    this.authService.onLogin(user)
      .subscribe((response: User) => {
        this.user = response;
        this.router.navigate(['/']);
        this.isLoading = false;
        localStorage.setItem('user', JSON.stringify(this.user));
      },
        (error) => {
          this.errorMessage = error;
          if (this.errorMessage) {
            setTimeout(() => {
              this.errorMessage = null;
            }, 2000);
          }
          this.isLoading = false;
        }
      );
  }

  autologin() {
    const user: {
      userName: string,
      _token: string,
      expiresIn: string
    } = JSON.parse(localStorage.getItem('user'));

    if (!user) {
      return;
    }

    const loadedUser = new User(new Date(user.expiresIn), user.userName, user._token,);

    if (loadedUser._token) {
      this.userBehSub.next(loadedUser);
    }
  }
}
