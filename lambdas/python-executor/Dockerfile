FROM public.ecr.aws/lambda/python:3.12

# Copy requirements.txt file
COPY requirements.txt ./

# Downgrades to RIE version 1.10 because they can't fucking fix the following issue:
# https://github.com/aws/aws-lambda-runtime-interface-emulator/issues/97
RUN curl -Lo /usr/local/bin/aws-lambda-rie https://github.com/aws/aws-lambda-runtime-interface-emulator/releases/download/v1.10/aws-lambda-rie && chmod +x /usr/local/bin/aws-lambda-rie

# Install the python dependencies
RUN pip install -r requirements.txt

# Copy function code
COPY main.py ./ 

# Set the CMD to your handler (could also be done as a parameter override outside of the Dockerfile)
CMD [ "main.handler" ]