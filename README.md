# angular-nav-login

[![Build Status][travis-image]][travis-url]

[travis-url]: https://travis-ci.com/fielded/nav-integrated-state-login
[travis-image]: https://travis-ci.com/fielded/nav-integrated-state-login.svg

> Login components for NAV applications

## Installation

Install with `bower`:

```shell
bower install --save fielded/angular-nav-login
```

or `npm`:

```shell
npm install --save fielded/angular-nav-login
```

Depends on the following **runtime** services:

```
config
sessionService
toastService
mainService
```

Make sure your app registers them somewhere.

Then simply add `angularNavLogin` as a dependency somewhere in your project that makes sense and you're good to go.

## Contributing

### Installation

```bash
# Clone the GitHub repository
git clone git@github.com:fielded/angular-nav-login.git
# Change into project folder
cd angular-nav-login
# Install the dev dependencies
npm install
```

### Test Suite

The test suite is configured to run with PhantomJS and is powered by:

- Karma
- Jasmine

#### Running Tests

```bash
npm test
```

## Release Process

To make a release, you need to run `npm run build`, commit the `dist` folder and tag the commit with an appropiate version according to the [SemVer spec](http://semver.org/).

## License

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.  You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  See the License for the specific language governing permissions and limitations under the License.
