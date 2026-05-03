FROM python:3.13-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        bash \
        curl \
        unzip \
        groff \
        less \
        git \
        ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY tools/ansible/requirements.txt /tmp/requirements.txt
COPY tools/ansible/requirements.yml /tmp/requirements.yml

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r /tmp/requirements.txt \
    && ansible-galaxy collection install -r /tmp/requirements.yml

RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "/tmp/awscliv2.zip" \
    && unzip /tmp/awscliv2.zip -d /tmp \
    && /tmp/aws/install \
    && rm -rf /tmp/aws /tmp/awscliv2.zip

RUN curl "https://s3.amazonaws.com/session-manager-downloads/plugin/latest/ubuntu_64bit/session-manager-plugin.deb" \
    -o "/tmp/session-manager-plugin.deb" \
    && apt-get update \
    && apt-get install -y --no-install-recommends /tmp/session-manager-plugin.deb \
    && rm -rf /var/lib/apt/lists/* /tmp/session-manager-plugin.deb

WORKDIR /workspace/ansible