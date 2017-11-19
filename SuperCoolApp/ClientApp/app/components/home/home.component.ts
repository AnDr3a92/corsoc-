import { Component, Inject } from '@angular/core';
import { Headers, Http, RequestOptions } from '@angular/http';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/debounceTime.js';
import 'rxjs/add/observable/forkJoin';


@Component({
    selector: 'home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent {
    [x: string]: any;
    public careers: Career[];
    public selectedCareer: Career | undefined;
    public course: Course = new Course();
    public newCareer: Career = new Career();
    constructor(private http: Http, @Inject('BASE_URL') private baseUrl: string) {
        this.refreshData();
    }

    async refreshData() {
        this.http.get(this.baseUrl + 'api/careers').subscribe(result => {
            let careerList = [];

            for (let car of result.json() as Career[]) {

                let career = new Career();
                career.id = car.id;
                career.name = car.name;
                career.credit = car.credit;
                career.courses = car.courses;
                career.hasChanges = false;
              
                career.deleted = false;
                careerList.push(career);
            }

            console.log("ok");

            this.careers = careerList;

         
        }, error => console.error(error));
    }
    
 
    selectCareer(): void {

        this.selectedCareer = undefined;

        for (let car of this.careers) {
            if (car.deleted == false) {
                this.selectedCareer = car;
                break;
            }

        }
    }


    async putData(): Promise<void> {
        let headers = new Headers({ 'Content-Type': 'application/json' });

        let serverCalls = [];

        for (let career of this.careers) {
            if (career.hasChanges == true || career.deleted) {

                let json = JSON.stringify(career);

                if (!career.id) { //create
                    if (!career.deleted) {
                        let call = this.http.put(this.baseUrl + 'api/careers', json, { headers: headers });
                        serverCalls.push(call);
                    }
                }
                else {
                    if (career.deleted) {
                        let url = this.baseUrl + 'api/careers?id=' + career.id;
                        let call = this.http.delete(url, { headers: headers });
                        serverCalls.push(call);
                    }
                    else {
                        let call = this.http.post(this.baseUrl + 'api/careers', json, { headers: headers });
                        serverCalls.push(call);
                    }

                }
            }
        }
        Observable.forkJoin(serverCalls)
            .subscribe(data => {
                this.refreshData();
            }, error => console.error(error));


    }

    onSelect(career: Career): void {

        if (career.deleted == false) {
            this.selectedCareer = career;
        }
    }

    addNewCareer(): void {

        this.newCareer.hasChanges = true;
        
       
    }

    async saveChanges(): Promise<void> {
        this.careers.push(this.newCareer);
        await this.putData();
        this.newCareer = new Career();
        
    }

    async delete(career: Career) {
        career.deleted = true;
        this.selectCareer();
        await this.putData();
    }
    showCourses(career: Career): void {

        this.selectedCareer = career;
        
        this.selectedCareer.showCourses =!this.selectedCareer.showCourses ;
    }
    async addNewCourse(car: Career, course: Course) {
        let credit = 0;
        course.owner = "carriera";
        for (let cour of car.courses)
            credit += cour.credit;
        if (credit + course.credit <= car.credit) {
            car.courses.push(course);
            car.hasChanges = true;
          
        await this.putData();
        }
        this.course = new Course();
    }
    async deletePostCourse(car: Career): Promise<void>  {
        
        let headers = new Headers({ 'Content-Type': 'application/json' });

        let serverCalls = [];
       
        let json = JSON.stringify(car);
        let call = this.http.post(this.baseUrl + 'api/careers', json, { headers: headers });
        serverCalls.push(call);
        Observable.forkJoin(serverCalls)
        .subscribe(data => {
            this.selectedCareer = car;
            this.selectedCareer.showCourses = false;
        }, error => console.error(error));
    }


  async  deleteCourse(car: Career, course: Course){
     let career = new Career();
        for (let cour of car.courses) {
            if(cour!=course)
            career.courses.push(cour);
       }
        career.id = car.id;
        career.name = car.name;
        career.credit = car.credit;
        car.courses = career.courses;
        car.hasChanges = true;
        await this.deletePostCourse(car);
        

    }
}
export class Career {
    id: number;

    public name: string;
    public credit: number;
    public courses: Course[] = new Array;
    public hasChanges: boolean;
    public deleted: boolean = false;
    public showCourses: boolean = false;






}

export class Course {
    name: string;
    description: string;
    semester: number;
    hours: number;
    credit: number;
    owner: string;
}