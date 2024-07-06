FROM node:16

RUN apt-get update && \
    apt-get install -y software-properties-common && \
    apt-get update && \
    apt-get install -y python3.11 python3.11-distutils python3.11-pip

WORKDIR /usr/src/app

COPY package*.json .
RUN npm install

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 3000
CMD ["npm", "start"]