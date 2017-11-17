import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './components/app/app.component';
import { NavMenuComponent } from './components/navmenu/navmenu.component';
import { HomeComponent } from './components/home/home.component';
import { StudentsComponent } from './components/students/students.component';
import { PersonalCareerComponent } from './components/personalcareer/personalcareer.component';
@NgModule({
    declarations: [
        AppComponent,
        NavMenuComponent,
        HomeComponent,
        StudentsComponent,
        PersonalCareerComponent 
    ],
    imports: [
        CommonModule,
        HttpModule,
        FormsModule,
        RouterModule.forRoot([
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'careers', component: HomeComponent },
            { path: 'students', component: StudentsComponent },
           // { path: '**', redirectTo: 'home' },
            { path: 'students/:id', component: PersonalCareerComponent }
        ])
    ]
})
export class AppModuleShared {
}
