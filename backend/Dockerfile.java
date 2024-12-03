FROM openjdk:17
WORKDIR /code
COPY ./user-submissions/Main.java /code/Main.java
RUN javac Main.java
CMD ["java", "Main"]
