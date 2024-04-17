# CV Parser Microservice

Welcome to the CV Parser Microservice repository. This project serves as a microservice designed to parse CV files, format them, and send them to an IA Microservice for further parsing. The parsed data from the IA service is then stored as a response.

## Getting Started

These instructions will help you set up a copy of this microservice for development and experimentation.

### Prerequisites

- Node.js (version 14 or later recommended)
- npm (version 6 or later)

### Installation

1. **Clone the Repository**

   Clone this repository to your local machine to begin working on your microservice:

   ```bash
   git clone https://github.com/Linkopus/ParserMs.git
   ```

   Navigate to the repository:

   ```bash
   cd ParserMs
   ```

2. **Install Dependencies**

Install the necessary npm packages defined in `package.json`:

    npm install

### Project Structure

Here's an overview of the project's directory structure:

- `src/`: Contains the source code for the microservice, including TypeScript files.
  - `services/`: Contains service files responsible for business logic.
  - `middlewares/`: Contains middleware files for request processing.
  - `utils/`: Contains utility files for common functionalities.
    - `messagesTypes.ts`: Defines message types used in the microservice.
    - `StatusCode.ts`: Defines HTTP status codes for responses.
    - `Logger.ts`: Provides logging functionalities for the microservice.
    - `ApiError.ts`: Defines custom error classes for API errors.
- `routes/`: Defines Express routes for your microservice's API endpoints.
- `__tests__/`: Contains test files for the microservice.
- `index.ts`: The entry point for the microservice application.
- `tsconfig.json`: Configuration file for TypeScript.
- `jest.config.ts`: Configuration file for Jest, used for running tests.
- `Dockerfile`: Docker configuration for building a containerized version of the microservice.
- `.eslintrc.json`: ESLint configuration for linting TypeScript files.

### Running the Service

To start the microservice locally, run:

    npm run dev

This command will start the application in development mode with hot reloading enabled.

### Running Tests

Execute the following command to run the test suite:

    npm test

This will run all tests defined in the `__tests__/` directory using Jest.

### Linting

To check for linting errors in the TypeScript files, run:

    npm run lint

To automatically fix linting errors, run:

    npm run lint:fix

## Dockerization

Ensure that you are in the project's root directory when running these commands.

### Build Image docker :

1. **Using Docker Compose**

Build and Start the Container :

    docker-compose up --build

Stopping Docker Compose :
To stop the running containers started by Docker Compose, you can use the following command

    docker-compose down

2.  **Using Docker Run**
    Execute the following command to build the Docker image:

        docker build -t linkopus-parserms .

### Run Image docker :

Execute the following command to run the container:

    docker run linkopus-parserms

###### Locally :

To run the application locally, you can use the `-e` flag followed by each variable and its value.

    sudo docker run --network host -e MONGODB_URI=mongodb://localhost:27017/parser -e PORT=3005 linkopus-parserms

#### To stop a running container:

    sudo docker ps
    sudo docker stop <container_id_or_name>

Make sure to replace `<container_id_or_name>` with the actual ID or name of the container you want to stop.


## Contributing

Contributions to this project are welcome. Feel free to create a new branch, make your changes, and submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE). See the LICENSE file in the repository for full details.
