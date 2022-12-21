/*
 * — Author: @qdouvillez
 * — Create Time: 19 Dec 2022 at 13:25
 * — Description: Api Service
*/

interface ApiError {
    message: string;
    statusCode: number;
    action?: string;
}

class Api {
    private transQueries (q: Array<string>): String {
        let ret = "?";
        for(let i = 0; i < q.length; i++) {
            ret += q[i];
            if(i < q.length - 1) ret += "&";
        }
        return ret;
    };

    private redirect() {
        return "hello"
    }

    private handleError(error: any): ApiError {
        // Check the error status code and return a custom error object
    if (error.status === 401) {
        return { message: 'Unauthorized', statusCode: 401, action: this.redirect() };
    } else if (error.status === 404) {
        return { message: 'Not found', statusCode: 404 };
    } else {
        return { message: 'An unexpected error occurred', statusCode: 500 };
    }
    }

    public json(method: string, url: string, params: Array<string>, queries: Array<string>): Promise<any> {
        return new Promise((resolve, reject) => {
            fetch(url+params+this.transQueries(queries), {
                method: method,
                headers: {
                    'content-type': 'application/json;charset=UTF-8',
                },
            })
            .then((res) => {
                res.json()
                .then((json) => {
                    // cas d'erreur à gérer
                    return resolve(json);
                })
                .catch((err) => {
                    console.error(err);
                    return reject(this.handleError(err));
                })
            })
            .catch((err) => {
                console.error(err)
                return reject(this.handleError(err));
            })
        })
    }
}

export default Api;


// – private HandleError
// – Request json
// – Request file
// – Header
