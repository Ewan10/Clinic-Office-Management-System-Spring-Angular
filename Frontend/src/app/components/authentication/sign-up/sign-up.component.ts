import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { User } from '../../../models/user.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class SignUpComponent {
  errorMessage = null;
  constructor(private authService: AuthenticationService, private router: Router) { }

  formInvalid = false;
  isLoading = false;
  user: User;

  onSignUp(form: NgForm) {
    this.errorMessage = null;
    this.formInvalid = false;
    if (form.value.password === form.value.confirmPassword) {
      const user = {
        userName: form.value.username,
        email: form.value.email,
        password: form.value.password
      };
      this.isLoading = true;
      this.authService.onSignUp(user)
        .subscribe((response: User) => {
          this.user = response;
          form.reset();
          this.isLoading = false;
          this.router.navigate(['/']);
        },
          (error) => {
            this.errorMessage = error;
            this.isLoading = false;
          }
        );
    }
    else {
      this.formInvalid = true;
      this.errorMessage = 'Passwords do not match';

    }
  }
}
