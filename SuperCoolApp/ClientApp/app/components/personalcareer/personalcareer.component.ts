import { Component, Inject, SimpleChanges } from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/forkJoin';

import { Career, HomeComponent, Course } from '../home/home.component';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';

import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';

@Component({
    selector: 'personalcareer',
    templateUrl: 'personalcareer.component.html',
    styleUrls: ['./personalcareer.component.css']
})
export class PersonalCareerComponent {
    personalCareer: Career;
    careers$: Observable<Career[]>;
    career: Career[];
    courses: Course[];
    show: boolean = false;

    constructor(private http: Http, @Inject('BASE_URL') private baseUrl: string, private router: Router) {
        this.refreshData();

    }






    searchHttp(term: string): Observable<Career[]> {

        return this.http
            .get(this.baseUrl + 'api/car?name=' + term)
            .debounceTime(2500)
            .distinctUntilChanged()
            .map(res => res.json());
    }

    search(term: string) {


        this.careers$ = this.searchHttp(term);

    }
    async AddCareer(car: Career): Promise<void> {
        this.personalCareer = new Career();
        this.personalCareer = car;
          this.save();
    }
    AddCourse(career: Career, course: Course) {
        let courses = career.courses.indexOf(course);
        let crediti = 0;
        for (course of this.personalCareer.courses)
            crediti = course.credit;
        if (this.personalCareer.credit >= crediti + course.credit) {
            {
                career.courses.splice(courses, 1);
                this.personalCareer.courses.push(course);
            }
        }
    }
    async saveCareer(): Promise<void> {
        await this.save();
    }
    async save(): Promise<void> {
        let serverCalls = [];
        let headers = new Headers({ 'Content-Type': 'application/json' });
        let json = JSON.stringify(this.personalCareer);
        let call = this.http.post(this.baseUrl + 'api' + this.router.url + '/career', json, { headers: headers })
        serverCalls.push(call);
        Observable.forkJoin(serverCalls)
            .subscribe(data => {
                this.refreshData();
            }, error => console.error(error));


    }
    async refreshData() {
        this.http.get(this.baseUrl + 'api' + this.router.url + '/career').subscribe(result => {
            this.personalCareer = result.json() as Career;
            console.log("ok");
        }, error => console.error(error));
    }

    async getCourse() {
        this.http.get(this.baseUrl + 'api/careers').subscribe(result => {
            let careerList = [];

            for (let car of result.json() as Career[]) {
                if (car.id != this.personalCareer.id) {
                let career = new Career();
                career.id = car.id;
                career.name = car.name;
                career.credit = car.credit;
                career.courses = car.courses;
                career.hasChanges = false;

                career.deleted = false;
                careerList.push(career);
                }
            }

            console.log("ok");

            this.career = careerList;


        }, error => console.error(error));
    }
}