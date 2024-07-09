FROM python:3.12

WORKDIR /opt/app

COPY requirements.txt .
RUN pip install -r requirements.txt

RUN apt-get update && \
    apt-get install -y nodejs npm && \
    npm install -g npm@latest

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000
CMD ["npm", "start"]