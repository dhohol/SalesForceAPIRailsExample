require 'digest/md5'

class VisitorsController < ApplicationController
  include Databasedotcom::Rails::Controller
  # GET /visitors
  # GET /visitors.json

  def create
    status = 200 #default status: success
    response = ""
    params[:visitor][:sign_in] = Time.now.utc.iso8601
    #SalesForce API initilization via databasedotcom-rails gem
    config = YAML.load_file(File.join(::Rails.root, 'config', 'databasedotcom.yml'))
    client = Databasedotcom::Client.new(config)
    client.authenticate :username => config[:username], :password => config[:password]
    client.materialize("Lead")
    
    lead = Lead.find_by_Email(params[:visitor][:email])
    @visitor = Visitor.find_by_email(params[:visitor][:email])
    
    # if visitor doesn't exist create
    # otherwise, update the visitor (else)
    if @visitor.nil?
      @visitor = Visitor.new(params[:visitor])
      if @visitor.save!
        design = Design.last
        if ((design.print_after_signin or design.email_after_signin) rescue false)
          badge = badge_pdf(@visitor)
          BadgeMailer.registration_confirmation(badge).deliver if design.print_after_signin
          BadgeMailer.registration_confirmation(badge, @visitor.email).deliver if design.email_after_signin
        end
        response = "Authenticated and New Visitor Added"
      else
        response = "Could not add new Visitor"
        status   = 400
      end
    else
      response = "Existing user updated and signed in"
      if not @visitor.update_attributes(params[:visitor])
        if not @visitor.update_attributes(:sign_in => params[:visitor][:sign_in])
          response = "Could not update existing Visitor"
          status   = 400
        end
      end
    end

    #had to concat the sign_in time as it converts it with UTC label :/
    if lead.nil?
      Lead.create "LastName" => @visitor.last_name, "Company" => @visitor.company, "FirstName" => @visitor.first_name, "Email" => @visitor.email,
        "Street" => @visitor.address_1, "City" => @visitor.city, "State" => @visitor.province_state, "PostalCode" => @visitor.postal_zipcode,
        "Phone" => @visitor.phone, "Vehicle_Make__c" => @visitor.vehicle_make, "Vehicle_License_Plate__c" => @visitor.license_plate,
        "Time_In__c" => @visitor.sign_in, "Sign_Ins__c" => @visitor.sign_in.to_s(19)
      response += ". Created new user in SalesForce"
    else
      lead.update_attributes "LastName" => @visitor.last_name, "Company" => @visitor.company, "FirstName" => @visitor.first_name, "Email" => @visitor.email,
        "Street" => @visitor.address_1, "City" => @visitor.city, "State" => @visitor.province_state, "PostalCode" => @visitor.postal_zipcode,
        "Phone" => @visitor.phone, "Vehicle_Make__c" => @visitor.vehicle_make, "Vehicle_License_Plate__c" => @visitor.license_plate,
        "Time_In__c" => @visitor.sign_in
        
      lead.Sign_Ins__c = lead.Sign_Ins__c + " ; " unless lead.Sign_Ins__c.nil?
      lead.Sign_Ins__c = (lead.Sign_Ins__c.nil? ? "" : lead.Sign_Ins__c) + @visitor.sign_in.to_s(19)
      lead.save
    end

    respond_to do |format|
      format.html { redirect_to visitors_url }
      format.json { render :json => {:result => response}, :callback => params[:callback], :status => status }
    end
  end
  
  def signIn
    @visitor = if params.has_key?(:data)
      Visitor.find_by_qr_hash(params[:data])
    elsif params.has_key?(:email) and not params[:email].blank?
      Visitor.find_by_email(params[:email])
    else
      nil
    end
    success = !@visitor.nil?
    
    unless @visitor.nil?
      # if possible, update an existing lead
      lead = Lead.find_by_Email(@visitor.email)
      unless lead.nil?
        lead.update_attributes "LastName" => @visitor.last_name, "Company" => @visitor.company, "FirstName" => @visitor.first_name, "Email" => @visitor.email,
          "Street" => @visitor.address_1, "City" => @visitor.city, "State" => @visitor.province_state, "PostalCode" => @visitor.postal_zipcode,
          "Phone" => @visitor.phone, "Vehicle_Make__c" => @visitor.vehicle_make, "Vehicle_License_Plate__c" => @visitor.license_plate,
          "Time_In__c" => @visitor.sign_in          
        lead.Sign_Ins__c = lead.Sign_Ins__c + " ; " unless lead.Sign_Ins__c.nil?
        lead.Sign_Ins__c = (lead.Sign_Ins__c.nil? ? "" : lead.Sign_Ins__c) + @visitor.sign_in.to_s(19)
        lead.save
      end
    end
  
  end
